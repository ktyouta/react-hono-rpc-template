import { z } from "zod";

/**
 * ユーザー更新リクエストスキーマ
 */
export const UpdateFrontUserSchema = z.object({
  name: z
    .string()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(30, "ユーザー名は30文字以内で入力してください"),
  birthday: z
    .string()
    .regex(
      /^[0-9]{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
      "生年月日は日付形式(yyyyMMdd)で入力してください"
    ),
});

export type UpdateFrontUserSchemaType = z.infer<typeof UpdateFrontUserSchema>;
