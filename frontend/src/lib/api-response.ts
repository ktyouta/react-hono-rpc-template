import { z } from 'zod';

/**
 * API成功レスポンスの共通スキーマを生成する
 * @param dataSchema - dataフィールドに適用するZodスキーマ
 * @returns { status: number, message: string, data: T } 形式のスキーマ
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: z.number(),
    message: z.string(),
    data: dataSchema,
  });
}

/**
 * APIエラーレスポンスのスキーマ
 */
export const ApiErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
});
