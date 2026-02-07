import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import type { AppEnv } from "../../../../type";
import { formatZodErrors } from "../../../../util";
import { UpdateSampleRepository } from "../repository";
import { UpdateSampleParamSchema, UpdateSampleSchema } from "../schema";
import { UpdateSampleService } from "../service";
import { UpdateSampleUseCase } from "../usecase";

/**
 * サンプル更新
 * @route PUT /api/v1/sample/:id
 */
const updateSample = new Hono<AppEnv>().put(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", UpdateSampleParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  zValidator("json", UpdateSampleSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = c.get('db');
    const repository = new UpdateSampleRepository(db);
    const service = new UpdateSampleService(repository);
    const useCase = new UpdateSampleUseCase(service);

    const result = await useCase.execute(Number(id), body);

    if (!result.success) {
      return c.json({ message: result.message }, result.status);
    }

    return c.json({ message: result.message, data: result.data }, result.status);
  }
);

export { updateSample };

