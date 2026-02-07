import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { Cookie, RefreshToken } from "../../../domain";
import type { AppEnv } from "../../../type";
import { VerifyUseCase } from "../usecase/verify.usecase";


/**
 * 認証チェック
 * @route GET /api/v1/verify
 */
const verify = new Hono<AppEnv>().get(
    API_ENDPOINT.VERIFY,
    async (c) => {
        try {

            const db = c.get('db');
            const useCase = new VerifyUseCase(db);
            const cookie = new Cookie(getCookie(c));
            const refreshToken = RefreshToken.get(cookie);

            const result = await useCase.execute(refreshToken);

            if (!result.success) {
                console.warn(`verify failed: ${result.message}`);

                // エラー時はCookieをクリア
                setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

                return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
            }

            return c.json({ message: result.message, data: result.data }, 200);
        } catch (e) {
            console.warn(`Refresh failed: ${e}`);

            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

            return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
        }
    }
);

export { verify };

