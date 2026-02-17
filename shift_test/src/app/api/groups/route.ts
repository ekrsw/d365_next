import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validations/group";

export async function GET() {
  const groups = await prisma.group.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: {
        select: {
          employees: {
            where: { terminationDate: null },
          },
        },
      },
    },
  });

  return NextResponse.json(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      employeeCount: g._count.employees,
    }))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = groupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const group = await prisma.group.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json(group, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "このグループ名は既に使用されています" },
      { status: 409 }
    );
  }
}
