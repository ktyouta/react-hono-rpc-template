import { Hono } from "hono";
import type { AppEnv } from "../../type";
import { createFrontUser } from "./create/controller/create-front-user.controller";
import { updateFrontUser } from "./update/controller/update-front-user.controller";
import { deleteFrontUser } from "./delete/controller/delete-front-user.controller";

// ルーティング（チェーンで型情報を保持）
const frontUser = new Hono<AppEnv>()
    .route("/", createFrontUser)
    .route("/", updateFrontUser)
    .route("/", deleteFrontUser);

export { frontUser };
