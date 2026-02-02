import { z } from "zod";


export const UpdatePasswordRequestSchema = z.object({
    password: z.string()
        .nonempty("パスワードを入力してください")
        .min(3, "パスワードは3文字以上で入力してください")
        .max(30, "パスワードは30文字以内で入力してください"),
    confirmPassword: z.string()
        .nonempty("確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "確認用パスワードが一致しません",
    path: ["confirmPassword"]
});

export type UpdatePasswordRequestType = z.infer<typeof UpdatePasswordRequestSchema>;