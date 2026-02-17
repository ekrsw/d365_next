import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nameChangeSchema } from "@/lib/validations/employee";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  const { id, historyId } = await params;
  const employeeId = parseInt(id);
  const body = await request.json();
  const parsed = nameChangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const record = await prisma.employeeNameHistory.findUnique({
    where: { id: parseInt(historyId) },
  });

  if (!record || record.employeeId !== employeeId) {
    return NextResponse.json(
      { error: "レコードが見つかりません" },
      { status: 404 }
    );
  }

  const validFrom = new Date(parsed.data.validFrom);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Prisma.PrismaPromise<any>[] = [
    prisma.employeeNameHistory.update({
      where: { id: record.id },
      data: {
        name: parsed.data.name,
        nameKana: parsed.data.nameKana || null,
        validFrom,
        note: parsed.data.note || null,
      },
    }),
  ];

  // If editing the current record, also update the employee master
  if (record.isCurrent) {
    updates.push(
      prisma.employee.update({
        where: { id: employeeId },
        data: {
          name: parsed.data.name,
          nameKana: parsed.data.nameKana || null,
        },
      })
    );
  }

  // Update validTo of the previous record (the one right before this record)
  const previousRecord = await prisma.employeeNameHistory.findFirst({
    where: {
      employeeId,
      validFrom: { lt: record.validFrom },
    },
    orderBy: { validFrom: "desc" },
  });

  if (previousRecord) {
    const newValidTo = new Date(validFrom);
    newValidTo.setDate(newValidTo.getDate() - 1);
    updates.push(
      prisma.employeeNameHistory.update({
        where: { id: previousRecord.id },
        data: { validTo: newValidTo },
      })
    );
  }

  await prisma.$transaction(updates);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  const { id, historyId } = await params;
  const employeeId = parseInt(id);

  const record = await prisma.employeeNameHistory.findUnique({
    where: { id: parseInt(historyId) },
  });

  if (!record || record.employeeId !== employeeId) {
    return NextResponse.json(
      { error: "レコードが見つかりません" },
      { status: 404 }
    );
  }

  if (record.isCurrent) {
    // Find the previous record to promote as current
    const previousRecord = await prisma.employeeNameHistory.findFirst({
      where: {
        employeeId,
        id: { not: record.id },
      },
      orderBy: { validFrom: "desc" },
    });

    if (previousRecord) {
      await prisma.$transaction([
        prisma.employeeNameHistory.delete({
          where: { id: record.id },
        }),
        prisma.employeeNameHistory.update({
          where: { id: previousRecord.id },
          data: { isCurrent: true, validTo: null },
        }),
        prisma.employee.update({
          where: { id: employeeId },
          data: {
            name: previousRecord.name,
            nameKana: previousRecord.nameKana,
          },
        }),
      ]);
    } else {
      // Only record — just delete it
      await prisma.employeeNameHistory.delete({
        where: { id: record.id },
      });
    }
  } else {
    // Find the record right before this one and extend its validTo
    const previousRecord = await prisma.employeeNameHistory.findFirst({
      where: {
        employeeId,
        validFrom: { lt: record.validFrom },
      },
      orderBy: { validFrom: "desc" },
    });

    // Find the record right after this one
    const nextRecord = await prisma.employeeNameHistory.findFirst({
      where: {
        employeeId,
        validFrom: { gt: record.validFrom },
      },
      orderBy: { validFrom: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Prisma.PrismaPromise<any>[] = [
      prisma.employeeNameHistory.delete({
        where: { id: record.id },
      }),
    ];

    if (previousRecord && nextRecord) {
      // Bridge the gap: set previous validTo to nextRecord.validFrom - 1
      const newValidTo = new Date(nextRecord.validFrom);
      newValidTo.setDate(newValidTo.getDate() - 1);
      updates.push(
        prisma.employeeNameHistory.update({
          where: { id: previousRecord.id },
          data: { validTo: newValidTo },
        })
      );
    } else if (previousRecord && !nextRecord) {
      // Deleted record was the most recent past record before current
      updates.push(
        prisma.employeeNameHistory.update({
          where: { id: previousRecord.id },
          data: { validTo: null, isCurrent: true },
        })
      );
    }

    await prisma.$transaction(updates);
  }

  return new NextResponse(null, { status: 204 });
}
