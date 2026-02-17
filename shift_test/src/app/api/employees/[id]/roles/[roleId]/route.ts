import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const { roleId } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.isPrimary !== undefined) data.isPrimary = body.isPrimary;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if ("endDate" in body) {
    data.endDate = body.endDate ? new Date(body.endDate) : null;
  }

  const updated = await prisma.employeeFunctionRole.update({
    where: { id: parseInt(roleId) },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const { roleId } = await params;

  await prisma.employeeFunctionRole.delete({
    where: { id: parseInt(roleId) },
  });

  return new NextResponse(null, { status: 204 });
}
