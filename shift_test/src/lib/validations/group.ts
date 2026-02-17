import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().min(1, "グループ名は必須です").max(50),
});
