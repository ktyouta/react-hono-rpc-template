import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { DeleteSampleRepository } from "../repository";
import { DeleteSampleParamSchema } from "../schema";
import { DeleteSampleService } from "../service";
import { DeleteSampleUseCase } from "../usecase";

/**
 * サンプル削除
 * @route DELETE /api/v1/sample/:id
 */
const deleteSample = new Hono<AppEnv>().delete(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", DeleteSampleParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(c, HTTP_STATUS.BAD_REQUEST, "パラメータが不正です。", formatZodErrors(result.error));
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = c.get('db');
    const repository = new DeleteSampleRepository(db);
    const service = new DeleteSampleService(repository);
    const useCase = new DeleteSampleUseCase(service);

    const result = await useCase.execute(Number(id));

    return ApiResponse.create(c, result.status, result.message);
  }
);

export { deleteSample };

