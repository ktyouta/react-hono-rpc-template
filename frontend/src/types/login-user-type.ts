import z from "zod";

export const LoginUserSchema = z.object({
    userId: z.number().optional(),
    userName: z.string().min(3, `ユーザー名が3文字未満です。`),
    birthday: z.string().regex(/^\d{8}$/, `生年月日がyyyyMMdd形式ではありません。`),
});

// ログインユーザー情報の型
export type LoginUserType = z.infer<typeof LoginUserSchema>;