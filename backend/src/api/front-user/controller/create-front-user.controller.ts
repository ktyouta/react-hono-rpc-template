import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { envConfig } from "../../../config";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import {
    AccessToken,
    FrontUserBirthday,
    FrontUserId,
    FrontUserName,
    FrontUserPassword,
    FrontUserSalt,
    Pepper,
    RefreshToken,
    SeqKey,
    SeqIssue,
} from "../../../domain";
import { userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { CreateFrontUserResponseDto } from "../dto";
import { FrontUserEntity, FrontUserLoginEntity } from "../entity";
import { CreateFrontUserRepository } from "../repository";
import { CreateFrontUserSchema } from "../schema";

const SEQ_KEY = "front_user_id";

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
        const repository = new CreateFrontUserRepository(db);

        // ドメインオブジェクトを生成
        const userName = new FrontUserName(body.name);
        const userBirthday = new FrontUserBirthday(body.birthday);
        const salt = FrontUserSalt.generate();
        const pepper = new Pepper(envConfig.pepper);
        const userPassword = await FrontUserPassword.hash(
            body.password,
            salt,
            pepper
        );

        // ユーザー名重複チェック
        const existingUsers = await repository.findByUserName(userName);
        if (existingUsers.length > 0) {
            return c.json({ message: "既にユーザーが存在しています。" }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }

        // トランザクション: ID採番 + ログイン情報挿入 + ユーザー情報挿入
        const keyModel = new SeqKey(SEQ_KEY);
        const { userEntity, frontUserId } = await db.transaction(async (tx) => {
            const txRepo = new CreateFrontUserRepository(tx);

            // ユーザーIDを採番
            const newId = await SeqIssue.get(keyModel, tx);
            const userId = FrontUserId.of(newId);

            // ログイン情報を挿入
            const loginUserEntity = new FrontUserLoginEntity(
                userId,
                userName,
                userPassword,
                salt
            );
            await txRepo.insertFrontLoginUser(loginUserEntity);

            // ユーザー情報を挿入
            const entity = new FrontUserEntity(userId, userName, userBirthday);
            await txRepo.insertFrontUser(entity);

            return { userEntity: entity, frontUserId: userId };
        });

        // トークンを発行
        const accessToken = await AccessToken.create(frontUserId);
        const refreshToken = await RefreshToken.create(frontUserId);

        const responseDto = new CreateFrontUserResponseDto(
            userEntity,
            accessToken.token
        );

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, refreshToken.value, RefreshToken.COOKIE_SET_OPTION);

        return c.json({ message: "ユーザー情報の登録が完了しました。", data: responseDto.value }, HTTP_STATUS.CREATED);
    }
);

export { createFrontUser };
