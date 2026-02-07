import { UserIdParamSchema } from "@/schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { FrontUserPasswordSchema } from "../schema/front-user-password.schema";

/**
 * ユーザー更新
 * @route PATCH /api/v1/frontuser-password/:userId
 */
const updateFrontUser = new Hono<AppEnv>().patch(
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
        const authUser = c.var.user;
        const body = c.req.valid("json");
        const db = c.get('db');

        return c.json({ message: ``, data: `` }, 200);
    }
);

export { updateFrontUser };

