import { z } from "zod";

export const employeeCreateSchema = z.object({
  name: z.string().min(1, "氏名は必須です").max(100),
  nameKana: z.string().max(100).optional().nullable(),
  groupId: z.number({ error: "グループを選択してください" }),
  assignmentDate: z.string().optional().nullable(),
});

export const employeeUpdateSchema = z.object({
  groupId: z.number().optional().nullable(),
  assignmentDate: z.string().optional().nullable(),
  terminationDate: z.string().optional().nullable(),
});

export const roleAssignSchema = z.object({
  functionRoleId: z.number({ error: "役割を選択してください" }),
  isPrimary: z.boolean(),
  startDate: z.string().min(1, "開始日は必須です"),
});

export const roleEditSchema = z.object({
  isPrimary: z.boolean(),
  startDate: z.string().min(1, "開始日は必須です"),
  endDate: z.string().optional().nullable(),
});

export const nameChangeSchema = z.object({
  name: z.string().min(1, "氏名は必須です").max(100),
  nameKana: z.string().max(100).optional().nullable(),
  validFrom: z.string().min(1, "変更日は必須です"),
  note: z.string().max(255).optional().nullable(),
});
