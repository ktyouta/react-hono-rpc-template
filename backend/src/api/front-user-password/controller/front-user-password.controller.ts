import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { envConfig } from "../../../config";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import {
    FrontUserId,
    FrontUserPassword,
    FrontUserSalt,
    Pepper,
} from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import { UserIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { FrontUserPasswordRepository } from "../repository";
import { FrontUserPasswordSchema } from "../schema";
import { FrontUserPasswordService } from "../service/front-user-password.service";

/**
 * ユーザー更新
 * @route PATCH /api/v1/frontuser-password/:userId
 */
const frontUserPassword = new Hono<AppEnv>().patch(
    `${API_ENDPOINT.FRONT_USER_PASSWORD}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    zValidator("json", FrontUserPasswordSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const body = c.req.valid("json");
        const db = c.get('db');
        const repository = new FrontUserPasswordRepository(db);
        const service = new FrontUserPasswordService(repository);
        const frontUserId = FrontUserId.of(userId);

        // ユーザー情報を取得
        const loginInfo = await service.getLoginUser(frontUserId);

        if (!loginInfo) {
            return c.json({ message: "パスワードの更新に失敗しました。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // パスワード検証
        const pepper = new Pepper(envConfig.pepper);
        const salt = FrontUserSalt.of(loginInfo.salt);
        const nowPassword = await FrontUserPassword.hash(
            body.nowPassword,
            salt,
            pepper
        );

        if (service.isMatchPassword(nowPassword, loginInfo)) {
            return c.json({ message: "パスワードの更新に失敗しました。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // パスワード更新
        const updateResult = await service.updateFrontLoginUser(frontUserId, await FrontUserPassword.hash(
            body.newPassword,
            salt,
            pepper,
        ));

        if (!updateResult) {
            return c.json({ message: "パスワードの更新に失敗しました。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        return c.json({ message: "パスワードの更新に成功しました。" }, HTTP_STATUS.OK);
    }
);

export { frontUserPassword };
