import type { NotFoundHandler } from "hono";
import { HTTP_STATUS } from "../constant";
import type { AppEnv } from "../type";

/**
 * 404ハンドラー
 */
export const notFoundHandler: NotFoundHandler<AppEnv> = (c) => {
  const origin = c.req.header('origin') ?? '';

  return c.json(
    {
      status: HTTP_STATUS.NOT_FOUND,
      message: "Not Found",
    },
    HTTP_STATUS.NOT_FOUND,
    {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    }
  );
};
