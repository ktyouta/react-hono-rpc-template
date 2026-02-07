import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RefreshToken } from "../../../domain";
import { userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { CreateFrontUserSchema } from "../schema";
import { CreateFrontUserUseCase } from "../usecase";

/**
 * ユーザー作成
 * @route POST /api/v1/frontuser
 */
const createFrontUser = new Hono<AppEnv>().post(
    API_ENDPOINT.FRONT_USER,
    userOperationGuardMiddleware,
    zValidator("json", CreateFrontUserSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const body = c.req.valid("json");
        const db = c.get('db');
        const useCase = new CreateFrontUserUseCase(db);

        const result = await useCase.execute(body);

        if (!result.success) {
            return c.json({ message: result.message }, result.status);
        }

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, result.data.refreshToken, RefreshToken.COOKIE_SET_OPTION);

        return c.json({ message: result.message, data: result.data.response }, result.status);
    }
);

export { createFrontUser };
