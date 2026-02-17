import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const roles = await prisma.functionRole.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(
    roles.map((r) => ({
      id: r.id,
      roleCode: r.roleCode,
      roleName: r.roleName,
      roleType: r.roleType,
      isActive: r.isActive,
    }))
  );
}
