import { z } from "zod";

/**
 * ユーザーIDパラメータスキーマ
 */
export const UserIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, "ユーザーIDは数値で指定してください"),
});

export type UserIdParamSchemaType = z.infer<typeof UserIdParamSchema>;
