import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validations/group";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = groupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const group = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { name: parsed.data.name },
    });
    return NextResponse.json(group);
  } catch {
    return NextResponse.json(
      { error: "このグループ名は既に使用されています" },
      { status: 409 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const groupId = parseInt(id);

  const count = await prisma.employee.count({
    where: { groupId, terminationDate: null },
  });

  if (count > 0) {
    return NextResponse.json(
      { error: `このグループには${count}名の従業員が所属しています。削除できません。` },
      { status: 409 }
    );
  }

  await prisma.group.delete({ where: { id: groupId } });
  return new NextResponse(null, { status: 204 });
}
