import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const shiftId = parseInt(id);
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.shiftCode !== undefined) data.shiftCode = body.shiftCode || null;
  if (body.startTime !== undefined) {
    data.startTime = body.startTime
      ? new Date(`1970-01-01T${body.startTime}:00`)
      : null;
  }
  if (body.endTime !== undefined) {
    data.endTime = body.endTime
      ? new Date(`1970-01-01T${body.endTime}:00`)
      : null;
  }
  if (body.isHoliday !== undefined) data.isHoliday = body.isHoliday;
  if (body.isPaidLeave !== undefined) data.isPaidLeave = body.isPaidLeave;
  if (body.isRemote !== undefined) data.isRemote = body.isRemote;

  // Update shift (trigger records history automatically)
  const shift = await prisma.shift.update({
    where: { id: shiftId },
    data,
  });

  // If note provided, update the latest history record
  if (body.note) {
    const latestHistory = await prisma.shiftChangeHistory.findFirst({
      where: { shiftId },
      orderBy: { version: "desc" },
    });
    if (latestHistory) {
      await prisma.shiftChangeHistory.update({
        where: { id: latestHistory.id },
        data: { note: body.note },
      });
    }
  }

  return NextResponse.json(shift);
}
