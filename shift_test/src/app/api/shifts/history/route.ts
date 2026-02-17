import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Prisma.ShiftChangeHistoryWhereInput = {};

  if (q) {
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nameKana: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    where.employeeId = { in: employees.map((e) => e.id) };
  }

  if (from || to) {
    where.shiftDate = {};
    if (from) (where.shiftDate as Prisma.DateTimeFilter).gte = new Date(from);
    if (to) (where.shiftDate as Prisma.DateTimeFilter).lte = new Date(to);
  }

  if (type !== "all") {
    where.changeType = type;
  }

  const [data, total] = await Promise.all([
    prisma.shiftChangeHistory.findMany({
      where,
      orderBy: { changedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        shift: true,
      },
    }),
    prisma.shiftChangeHistory.count({ where }),
  ]);

  // Get employee names
  const employeeIds = [...new Set(data.map((d) => d.employeeId).filter(Boolean))] as number[];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, name: true },
  });
  const employeeMap = new Map(employees.map((e) => [e.id, e.name]));

  const formatTime = (t: Date | null | undefined) => {
    if (!t) return null;
    const h = String(t.getHours()).padStart(2, "0");
    const m = String(t.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const result = data.map((h) => ({
    id: h.id,
    shiftId: h.shiftId,
    employee: {
      id: h.employeeId,
      name: h.employeeId ? employeeMap.get(h.employeeId) || "" : "",
    },
    shiftDate: h.shiftDate.toISOString().split("T")[0],
    changeType: h.changeType,
    version: h.version,
    changedAt: h.changedAt.toISOString(),
    note: h.note,
    previous: {
      shiftCode: h.shiftCode,
      startTime: formatTime(h.startTime),
      endTime: formatTime(h.endTime),
      isHoliday: h.isHoliday ?? false,
      isPaidLeave: h.isPaidLeave ?? false,
      isRemote: h.isRemote ?? false,
    },
    current: h.shift
      ? {
          shiftCode: h.shift.shiftCode,
          startTime: formatTime(h.shift.startTime),
          endTime: formatTime(h.shift.endTime),
          isHoliday: h.shift.isHoliday ?? false,
          isPaidLeave: h.shift.isPaidLeave ?? false,
          isRemote: h.shift.isRemote ?? false,
        }
      : null,
  }));

  return NextResponse.json({
    data: result,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
