import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleAssignSchema } from "@/lib/validations/employee";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roles = await prisma.employeeFunctionRole.findMany({
    where: { employeeId: parseInt(id) },
    include: { functionRole: true },
    orderBy: { startDate: "desc" },
  });

  const current = roles
    .filter((r) => !r.endDate)
    .map((r) => ({
      id: r.id,
      functionRoleId: r.functionRoleId,
      roleName: r.functionRole?.roleName || "",
      roleCode: r.functionRole?.roleCode || "",
      roleType: r.roleType,
      isPrimary: r.isPrimary,
      startDate: r.startDate?.toISOString().split("T")[0] || null,
    }));

  const past = roles
    .filter((r) => r.endDate)
    .map((r) => ({
      id: r.id,
      functionRoleId: r.functionRoleId,
      roleName: r.functionRole?.roleName || "",
      roleCode: r.functionRole?.roleCode || "",
      roleType: r.roleType,
      isPrimary: r.isPrimary,
      startDate: r.startDate?.toISOString().split("T")[0] || null,
      endDate: r.endDate!.toISOString().split("T")[0],
    }));

  return NextResponse.json({ current, past });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const employeeId = parseInt(id);
  const body = await request.json();
  const parsed = roleAssignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get role_type of the new role
  const functionRole = await prisma.functionRole.findUnique({
    where: { id: parsed.data.functionRoleId },
  });

  if (!functionRole) {
    return NextResponse.json({ error: "役割が見つかりません" }, { status: 404 });
  }

  // End existing role of the same role_type and create new assignment atomically
  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() - 1);

  try {
    const created = await prisma.$transaction(async (tx) => {
      await tx.employeeFunctionRole.updateMany({
        where: {
          employeeId,
          roleType: functionRole.roleType,
          endDate: null,
        },
        data: {
          endDate,
        },
      });

      return tx.employeeFunctionRole.create({
        data: {
          employeeId,
          functionRoleId: parsed.data.functionRoleId,
          roleType: functionRole.roleType,
          isPrimary: parsed.data.isPrimary,
          startDate,
        },
        include: { functionRole: true },
      });
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "この従業員には同じ役割カテゴリの現行レコードが既に存在します" },
        { status: 409 }
      );
    }
    throw error;
  }
}
