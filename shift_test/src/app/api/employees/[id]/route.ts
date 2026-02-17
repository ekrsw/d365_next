import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employeeUpdateSchema } from "@/lib/validations/employee";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id: parseInt(id) },
    include: {
      group: true,
      functionRoles: {
        include: { functionRole: true },
        orderBy: { startDate: "desc" },
      },
      nameHistory: {
        orderBy: { validFrom: "desc" },
      },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "従業員が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({
    id: employee.id,
    name: employee.name,
    nameKana: employee.nameKana,
    group: employee.group ? { id: employee.group.id, name: employee.group.name } : null,
    groupId: employee.groupId,
    assignmentDate: employee.assignmentDate?.toISOString().split("T")[0] || null,
    terminationDate: employee.terminationDate?.toISOString().split("T")[0] || null,
    isActive: !employee.terminationDate,
    roles: employee.functionRoles.map((efr) => ({
      id: efr.id,
      functionRoleId: efr.functionRoleId,
      roleName: efr.functionRole?.roleName || "",
      roleCode: efr.functionRole?.roleCode || "",
      roleType: efr.roleType,
      isPrimary: efr.isPrimary,
      startDate: efr.startDate?.toISOString().split("T")[0] || null,
      endDate: efr.endDate?.toISOString().split("T")[0] || null,
    })),
    nameHistory: employee.nameHistory.map((nh) => ({
      id: nh.id,
      name: nh.name,
      nameKana: nh.nameKana,
      validFrom: nh.validFrom.toISOString().split("T")[0],
      validTo: nh.validTo?.toISOString().split("T")[0] || null,
      isCurrent: nh.isCurrent,
      note: nh.note,
      createdAt: nh.createdAt?.toISOString() || null,
    })),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = employeeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const employee = await prisma.employee.update({
    where: { id: parseInt(id) },
    data: {
      groupId: parsed.data.groupId,
      assignmentDate: parsed.data.assignmentDate
        ? new Date(parsed.data.assignmentDate)
        : null,
      terminationDate: parsed.data.terminationDate
        ? new Date(parsed.data.terminationDate)
        : null,
    },
    include: { group: true },
  });

  return NextResponse.json(employee);
}
