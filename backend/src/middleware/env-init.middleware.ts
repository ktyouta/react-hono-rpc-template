import type { Context, Next } from "hono";
import type { AppEnv } from "../type";
import { envConfig } from "../config";

/**
 * 環境変数初期化ミドルウェア
 */
export const envInitMiddleware = async (c: Context<AppEnv>, next: Next) => {

    envConfig.init(c.env);

    await next();
};
