import { Hono } from "hono";
import type { AppEnv } from "../../type";
import { getListSample } from "./get-list/controller/get-list-sample.controller";
import { getSampleById } from "./get/controller/get-sample.controller";
import { createSample } from "./create/controller/create-sample.controller";
import { updateSample } from "./update/controller/update-sample.controller";
import { deleteSample } from "./delete/controller/delete-sample.controller";

// ルーティング（チェーンで型情報を保持）
const sample = new Hono<AppEnv>()
    .route("/", getListSample)
    .route("/", getSampleById)
    .route("/", createSample)
    .route("/", updateSample)
    .route("/", deleteSample);

export { sample };
