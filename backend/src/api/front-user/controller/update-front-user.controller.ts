import { UserIdParamSchema } from "../../../schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import {
    FrontUserBirthday,
    FrontUserId,
    FrontUserName,
    RefreshToken,
} from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { UpdateFrontUserResponseDto } from "../dto";
import { UpdateFrontUserRepository } from "../repository";
import { UpdateFrontUserSchema } from "../schema";

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
        const config = c.get('envConfig');

        const frontUserId = FrontUserId.of(userId);
        const userName = new FrontUserName(body.name);
        const userBirthday = new FrontUserBirthday(body.birthday);

        // トランザクション: 重複チェック + ログイン情報更新 + ユーザー情報更新
        const updated = await db.transaction(async (tx) => {
            const txRepo = new UpdateFrontUserRepository(tx);

            // ユーザー名重複チェック（自身を除く）
            if (await txRepo.checkUserNameExists(frontUserId, userName)) {
                return { duplicate: true as const };
            }

            // ログイン情報を更新
            await txRepo.updateFrontLoginUser(frontUserId, userName.value);

            // ユーザー情報を更新
            const result = await txRepo.updateFrontUser(
                frontUserId,
                userName.value,
                userBirthday.value
            );

            return { duplicate: false as const, user: result };
        });

        if (updated.duplicate) {
            return c.json({ message: "既にユーザーが存在しています。" }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }

        if (!updated.user) {
            return c.json({ message: "ユーザーが見つかりません。" }, HTTP_STATUS.NOT_FOUND);
        }

        // 新しいリフレッシュトークンを発行
        const refreshToken = await RefreshToken.create(frontUserId, config);

        const responseDto = new UpdateFrontUserResponseDto(
            updated.user.id,
            updated.user.name,
            updated.user.birthday
        );

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, refreshToken.value, RefreshToken.getCookieSetOption(config));

        return c.json({ message: "ユーザー情報の更新が完了しました。", data: responseDto.value }, HTTP_STATUS.OK);
    }
);

export { updateFrontUser };
