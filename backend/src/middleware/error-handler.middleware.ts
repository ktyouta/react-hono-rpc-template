import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTP_STATUS } from "../constant";
import type { AppEnv } from "../type";

/**
 * 共通エラーハンドラー
 */
export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get("requestId") || "-";

  console.error(`[${requestId}] Error: ${err.message}`, err.stack);
  const origin = c.req.header("origin") ?? "";

  if (err instanceof HTTPException) {
    return c.json(
      {
        status: err.status,
        message: err.message,
      },
      err.status as ContentfulStatusCode,
      {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      }
    );
  }

  return c.json(
    {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    },
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
    }
  );
};
