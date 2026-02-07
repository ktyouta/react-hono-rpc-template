import { z } from "zod";

/**
 * ユーザーIDパラメータスキーマ
 */
export const UserIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type UserIdParamSchemaType = z.infer<typeof UserIdParamSchema>;
