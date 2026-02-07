import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RefreshToken } from "../../../domain";
import type { AppEnv } from "../../../type";


/**
 * ログアウト
 * @route POST /api/v1/frontuser-logout
 */
const frontUserLogout = new Hono<AppEnv>().post(
    API_ENDPOINT.LOGOUT,
    async (c) => {
        // リフレッシュトークンを削除
        deleteCookie(c, RefreshToken.COOKIE_KEY, RefreshToken.COOKIE_SET_OPTION);
        return c.json({ message: `ログアウトしました。` }, HTTP_STATUS.OK);
    }
);

export { frontUserLogout };

