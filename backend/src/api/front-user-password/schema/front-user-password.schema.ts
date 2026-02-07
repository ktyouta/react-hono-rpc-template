import { z } from "zod";

/**
 * パスワード更新リクエストスキーマ
 */
export const FrontUserPasswordSchema = z
  .object({
    nowPassword: z
      .string()
      .min(1, "現在のパスワードを入力してください"),
    newPassword: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(/^[\x21-\x7E]+$/, "パスワードは半角英数記号で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "確認用パスワードが一致しません。",
    path: ["confirmPassword"],
  });

export type FrontUserPasswordSchemaType = z.infer<typeof FrontUserPasswordSchema>;
