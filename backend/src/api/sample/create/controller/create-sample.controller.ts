import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import type { AppEnv } from "../../../../type";
import { formatZodErrors } from "../../../../util";
import { CreateSampleRepository } from "../repository";
import { CreateSampleSchema } from "../schema";
import { CreateSampleService } from "../service";
import { CreateSampleUseCase } from "../usecase";

/**
 * サンプル作成
 * @route POST /api/v1/sample
 */
const createSample = new Hono<AppEnv>().post(
  API_ENDPOINT.SAMPLE,
  zValidator("json", CreateSampleSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    const db = c.get('db');
    const repository = new CreateSampleRepository(db);
    const service = new CreateSampleService(repository);
    const useCase = new CreateSampleUseCase(service);

    const result = await useCase.execute(body);

    return c.json({ message: result.message, data: result.data }, result.status);
  }
);

export { createSample };

