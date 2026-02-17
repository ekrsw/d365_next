import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.shiftChangeHistory.findUnique({
    where: { id: numericId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "History record not found" },
      { status: 404 }
    );
  }

  await prisma.shiftChangeHistory.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ success: true });
}
