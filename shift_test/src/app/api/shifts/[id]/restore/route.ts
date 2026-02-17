import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const shiftId = parseInt(id);
  const body = await request.json();
  const { version } = body;

  const historyRecord = await prisma.shiftChangeHistory.findUnique({
    where: {
      shiftId_version: { shiftId, version },
    },
  });

  if (!historyRecord) {
    return NextResponse.json(
      { error: "指定されたバージョンが見つかりません" },
      { status: 404 }
    );
  }

  // Update shift to the historical state (trigger will record this change too)
  await prisma.shift.update({
    where: { id: shiftId },
    data: {
      shiftCode: historyRecord.shiftCode,
      startTime: historyRecord.startTime,
      endTime: historyRecord.endTime,
      isHoliday: historyRecord.isHoliday,
      isPaidLeave: historyRecord.isPaidLeave,
      isRemote: historyRecord.isRemote ?? false,
    },
  });

  // Update note on the new history record
  const latestHistory = await prisma.shiftChangeHistory.findFirst({
    where: { shiftId },
    orderBy: { version: "desc" },
  });
  if (latestHistory) {
    await prisma.shiftChangeHistory.update({
      where: { id: latestHistory.id },
      data: { note: `Version ${version} からの復元` },
    });
  }

  return NextResponse.json({ success: true });
}
