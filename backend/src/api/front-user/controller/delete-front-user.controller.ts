import { UserIdParamSchema } from "../../../schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { FrontUserId, RefreshToken } from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { DeleteFrontUserUseCase } from "../usecase";

/**
 * ユーザー削除
 * @route DELETE /api/v1/frontuser/:userId
 */
const deleteFrontUser = new Hono<AppEnv>().delete(
    `${API_ENDPOINT.FRONT_USER_ID}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const db = c.get('db');
        const useCase = new DeleteFrontUserUseCase(db);

        const result = await useCase.execute(FrontUserId.of(userId));

        if (!result.success) {
            return c.json({ message: result.message }, result.status);
        }

        // リフレッシュトークンCookieをクリア
        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

        return c.body(null, HTTP_STATUS.NO_CONTENT);
    }
);

export { deleteFrontUser };

