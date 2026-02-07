import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { FrontUserId } from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import { UserIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../type";
import { formatZodErrors } from "../../../util";
import { FrontUserPasswordSchema } from "../schema";
import { FrontUserPasswordUseCase } from "../usecase";

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
        const useCase = new FrontUserPasswordUseCase(db);

        const result = await useCase.execute(FrontUserId.of(userId), body);

        if (!result.success) {
            return c.json({ message: result.message }, result.status);
        }

        return c.json({ message: result.message }, result.status);
    }
);

export { frontUserPassword };

