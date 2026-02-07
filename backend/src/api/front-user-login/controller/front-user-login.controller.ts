import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { envConfig } from "../../../config";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import {
    AccessToken,
    FrontUserId,
    FrontUserName,
    FrontUserPassword,
    FrontUserSalt,
    Pepper,
    RefreshToken,
} from "../../../domain";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { FrontUserLoginResponseDto } from "../dto";
import { FrontUserLoginRepository } from "../repository";
import { FrontUserLoginSchema } from "../schema";
import { FrontUserLoginService } from "../service";


/**
 * ログイン
 * @route POST /api/v1/frontUserLogin
 */
const frontUserLogin = new Hono<AppEnv>().post(
    API_ENDPOINT.FRONT_USER_LOGIN,
    zValidator("json", FrontUserLoginSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const body = c.req.valid("json");
        const db = c.get('db');
        const repository = new FrontUserLoginRepository(db);
        const service = new FrontUserLoginService(repository);

        // ユーザー名からログイン情報を取得
        const userName = new FrontUserName(body.name);
        const loginInfo = await service.getLoginUser(userName);

        if (!loginInfo) {
            return c.json({ message: "IDかパスワードが間違っています。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // パスワード検証
        const frontUserId = FrontUserId.of(loginInfo.id);
        const salt = FrontUserSalt.of(loginInfo.salt);
        const pepper = new Pepper(envConfig.pepper);
        const password = await FrontUserPassword.hash(
            body.password,
            salt,
            pepper
        );

        if (service.isMatchPassword(password, loginInfo)) {
            return c.json({ message: "IDかパスワードが間違っています。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // ユーザー情報を取得
        const userInfo = await service.getUserInfo(frontUserId);

        if (!userInfo) {
            return c.json({ message: "IDかパスワードが間違っています。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // トークンを発行
        const accessToken = await AccessToken.create(frontUserId);
        const refreshToken = await RefreshToken.create(frontUserId);

        // 最終ログイン日時を更新
        await service.updateLastLoginDate(frontUserId);

        const responseDto = new FrontUserLoginResponseDto(
            userInfo,
            accessToken.token
        );

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, refreshToken.value, RefreshToken.COOKIE_SET_OPTION);

        return c.json({ message: "ログイン成功", data: responseDto.value }, HTTP_STATUS.OK);
    }
);

export { frontUserLogin };
