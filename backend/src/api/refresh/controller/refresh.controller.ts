import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { Cookie, RefreshToken } from "../../../domain";
import type { AppEnv } from "../../../type";
import { RefreshUseCase } from "../usecase";

/**
 * トークンリフレッシュ
 * @route POST /api/v1/refresh
 */
const refresh = new Hono<AppEnv>().post(API_ENDPOINT.REFRESH, async (c) => {

    try {

        const db = c.get('db');
        const useCase = new RefreshUseCase(db);
        const cookie = new Cookie(getCookie(c));
        const refreshToken = RefreshToken.get(cookie);

        const result = await useCase.execute(refreshToken);

        if (!result.success) {
            console.warn(`Refresh failed: ${result.message}`);

            // エラー時はCookieをクリア
            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

            return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // 新しいリフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, result.data.refreshToken, RefreshToken.COOKIE_SET_OPTION);

        return c.json({ message: result.message, data: result.data.accessToken }, 200);
    } catch (e) {
        console.warn(`Refresh failed: ${e}`);

        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

        return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
    }
});

export { refresh };
