import { Hono } from "hono";
import { cors } from "hono/cors";
import { frontUser, frontUserLogin, health, refresh, sample, verify } from "./api";
import { envConfig } from "./config";
import {
  accessLogMiddleware,
  createDbClientMiddleware,
  envInitMiddleware,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./middleware";
import type { AppEnv } from "./type";

const app = new Hono<AppEnv>();

// ミドルウェア設定
app.use("*", envInitMiddleware);
app.use(
  '*',
  cors({
    origin: (origin) => {
      return envConfig.corsOrigin.includes(origin) ? origin : '';
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);
app.use("*", requestIdMiddleware);
app.use("*", accessLogMiddleware);
app.use("*", createDbClientMiddleware);

// エラーハンドラー
app.onError(errorHandler);
app.notFound(notFoundHandler);

// ルーティング（チェーンで型情報を保持）
const routes = app
  .route("/", health)
  .route("/", sample)
  .route("/", frontUser)
  .route("/", frontUserLogin)
  .route("/", refresh)
  .route("/", verify);

// RPC用の型エクスポート
export type AppType = typeof routes;

export default app;
