import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { FrontUserId, RefreshToken } from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { UpdateFrontUserSchema, UserIdParamSchema } from "../schema";
import { UpdateFrontUserUseCase } from "../usecase";

/**
 * ユーザー更新
 * @route PATCH /api/v1/frontuser/:userId
 */
const updateFrontUser = new Hono<AppEnv>().patch(
    `${API_ENDPOINT.FRONT_USER_ID}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    zValidator("json", UpdateFrontUserSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const body = c.req.valid("json");
        const db = c.get('db');
        const useCase = new UpdateFrontUserUseCase(db);

        const result = await useCase.execute(FrontUserId.of(Number(userId)), body);

        if (!result.success) {
            return c.json({ message: result.message }, result.status);
        }

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, result.data.refreshToken, RefreshToken.COOKIE_SET_OPTION);

        return c.json({ message: result.message, data: result.data.response }, result.status);
    }
);

export { updateFrontUser };
