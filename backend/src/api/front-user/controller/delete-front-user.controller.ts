import { UserIdParamSchema } from "../../../schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { FrontUserId, RefreshToken } from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { DeleteFrontUserRepository } from "../repository";

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
        const config = c.get('envConfig');
        const frontUserId = FrontUserId.of(userId);

        // トランザクション: ログイン情報削除 + ユーザー情報削除
        const deleted = await db.transaction(async (tx) => {
            const txRepo = new DeleteFrontUserRepository(tx);

            // ログイン情報を削除
            await txRepo.deleteFrontLoginUser(frontUserId);

            // ユーザー情報を削除
            return await txRepo.deleteFrontUser(frontUserId);
        });

        if (!deleted) {
            return c.json({ message: "ユーザーが見つかりません。" }, HTTP_STATUS.NOT_FOUND);
        }

        // リフレッシュトークンCookieをクリア
        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));

        return c.body(null, HTTP_STATUS.NO_CONTENT);
    }
);

export { deleteFrontUser };
