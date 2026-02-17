import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employeeCreateSchema } from "@/lib/validations/employee";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const group = searchParams.get("group");
  const status = searchParams.get("status") || "active";
  const role = searchParams.get("role");
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Prisma.EmployeeWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nameKana: { contains: q, mode: "insensitive" } },
    ];
  }

  if (group) {
    where.groupId = parseInt(group);
  }

  if (status === "active") {
    where.terminationDate = null;
  } else if (status === "inactive") {
    where.terminationDate = { not: null };
  }

  if (role) {
    where.functionRoles = {
      some: {
        functionRoleId: parseInt(role),
        endDate: null,
      },
    };
  }

  const orderBy: Prisma.EmployeeOrderByWithRelationInput = {};
  const validSortFields = ["name", "assignmentDate"];
  if (validSortFields.includes(sort)) {
    (orderBy as Record<string, string>)[sort] = order === "desc" ? "desc" : "asc";
  }

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        group: true,
        functionRoles: {
          where: { endDate: null },
          include: { functionRole: true },
        },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  const employees = data.map((emp) => ({
    id: emp.id,
    name: emp.name,
    nameKana: emp.nameKana,
    group: emp.group ? { id: emp.group.id, name: emp.group.name } : null,
    roles: emp.functionRoles.map((efr) => ({
      id: efr.id,
      roleName: efr.functionRole?.roleName || "",
      roleType: efr.roleType,
      isPrimary: efr.isPrimary,
    })),
    assignmentDate: emp.assignmentDate?.toISOString().split("T")[0] || null,
    terminationDate: emp.terminationDate?.toISOString().split("T")[0] || null,
    isActive: !emp.terminationDate,
  }));

  return NextResponse.json({
    data: employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = employeeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: {
      name: parsed.data.name,
      nameKana: parsed.data.nameKana || null,
      groupId: parsed.data.groupId,
      assignmentDate: parsed.data.assignmentDate
        ? new Date(parsed.data.assignmentDate)
        : null,
    },
    include: { group: true },
  });

  // Create initial name history
  await prisma.employeeNameHistory.create({
    data: {
      employeeId: employee.id,
      name: employee.name,
      nameKana: employee.nameKana,
      validFrom: employee.assignmentDate || new Date(),
      isCurrent: true,
    },
  });

  return NextResponse.json(employee, { status: 201 });
}
