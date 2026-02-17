import { z } from "zod";

export const shiftEditSchema = z.object({
  shiftCode: z.string().max(20).optional().nullable(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください")
    .optional()
    .nullable(),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください")
    .optional()
    .nullable(),
  isHoliday: z.boolean(),
  isPaidLeave: z.boolean(),
  isRemote: z.boolean(),
  note: z.string().max(255).optional().nullable(),
});

export const shiftBulkEditSchema = z.object({
  shiftIds: z.array(z.number()).min(1, "対象を選択してください"),
  updates: z.object({
    shiftCode: z.string().max(20).optional().nullable(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    isHoliday: z.boolean().optional(),
    isPaidLeave: z.boolean().optional(),
    isRemote: z.boolean().optional(),
  }),
  note: z.string().max(255).optional().nullable(),
});
