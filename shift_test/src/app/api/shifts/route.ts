import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const groupFilter = searchParams.get("group");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const daysInMonth = endDate.getDate();

  const groupWhere = groupFilter ? { id: parseInt(groupFilter) } : {};

  const groups = await prisma.group.findMany({
    where: groupWhere,
    orderBy: { id: "asc" },
    include: {
      employees: {
        where: { terminationDate: null },
        orderBy: { name: "asc" },
        include: {
          shifts: {
            where: {
              shiftDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            orderBy: { shiftDate: "asc" },
          },
        },
      },
    },
  });

  const formatTime = (t: Date | null) => {
    if (!t) return null;
    const h = String(t.getHours()).padStart(2, "0");
    const m = String(t.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  return NextResponse.json({
    year,
    month,
    daysInMonth,
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      employees: g.employees.map((e) => ({
        id: e.id,
        name: e.name,
        shifts: e.shifts.map((s) => ({
          id: s.id,
          date: s.shiftDate.toISOString().split("T")[0],
          shiftCode: s.shiftCode,
          startTime: formatTime(s.startTime),
          endTime: formatTime(s.endTime),
          isHoliday: s.isHoliday ?? false,
          isPaidLeave: s.isPaidLeave ?? false,
          isRemote: s.isRemote,
        })),
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const shift = await prisma.shift.create({
    data: {
      employeeId: body.employeeId,
      shiftDate: new Date(body.shiftDate),
      shiftCode: body.shiftCode || null,
      startTime: body.startTime ? new Date(`1970-01-01T${body.startTime}:00`) : null,
      endTime: body.endTime ? new Date(`1970-01-01T${body.endTime}:00`) : null,
      isHoliday: body.isHoliday ?? false,
      isPaidLeave: body.isPaidLeave ?? false,
      isRemote: body.isRemote ?? false,
    },
  });

  return NextResponse.json(shift, { status: 201 });
}
