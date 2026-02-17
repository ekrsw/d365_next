import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nameChangeSchema } from "@/lib/validations/employee";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const history = await prisma.employeeNameHistory.findMany({
    where: { employeeId: parseInt(id) },
    orderBy: { validFrom: "desc" },
  });

  return NextResponse.json(
    history.map((h) => ({
      id: h.id,
      name: h.name,
      nameKana: h.nameKana,
      validFrom: h.validFrom.toISOString().split("T")[0],
      validTo: h.validTo?.toISOString().split("T")[0] || null,
      isCurrent: h.isCurrent,
      note: h.note,
      createdAt: h.createdAt?.toISOString() || null,
    }))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const employeeId = parseInt(id);
  const body = await request.json();
  const parsed = nameChangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const validFrom = new Date(parsed.data.validFrom);
  const validTo = new Date(validFrom);
  validTo.setDate(validTo.getDate() - 1);

  await prisma.$transaction([
    // End current name record
    prisma.employeeNameHistory.updateMany({
      where: { employeeId, isCurrent: true },
      data: { isCurrent: false, validTo },
    }),
    // Create new name record
    prisma.employeeNameHistory.create({
      data: {
        employeeId,
        name: parsed.data.name,
        nameKana: parsed.data.nameKana || null,
        validFrom,
        isCurrent: true,
        note: parsed.data.note || null,
      },
    }),
    // Update employee master
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: parsed.data.name,
        nameKana: parsed.data.nameKana || null,
      },
    }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
