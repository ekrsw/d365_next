import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { shiftIds, updates, note } = body;

  if (!shiftIds || !Array.isArray(shiftIds) || shiftIds.length === 0) {
    return NextResponse.json({ error: "対象を選択してください" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (updates.shiftCode !== undefined) data.shiftCode = updates.shiftCode || null;
  if (updates.startTime !== undefined) {
    data.startTime = updates.startTime
      ? new Date(`1970-01-01T${updates.startTime}:00`)
      : null;
  }
  if (updates.endTime !== undefined) {
    data.endTime = updates.endTime
      ? new Date(`1970-01-01T${updates.endTime}:00`)
      : null;
  }
  if (updates.isHoliday !== undefined) data.isHoliday = updates.isHoliday;
  if (updates.isPaidLeave !== undefined) data.isPaidLeave = updates.isPaidLeave;
  if (updates.isRemote !== undefined) data.isRemote = updates.isRemote;

  // Update each shift individually (so triggers fire for each)
  let count = 0;
  for (const shiftId of shiftIds) {
    await prisma.shift.update({
      where: { id: shiftId },
      data,
    });
    count++;

    if (note) {
      const latestHistory = await prisma.shiftChangeHistory.findFirst({
        where: { shiftId },
        orderBy: { version: "desc" },
      });
      if (latestHistory) {
        await prisma.shiftChangeHistory.update({
          where: { id: latestHistory.id },
          data: { note },
        });
      }
    }
  }

  return NextResponse.json({ count });
}
