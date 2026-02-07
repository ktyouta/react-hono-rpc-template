import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import type { AppEnv } from "../../../../type";
import { formatZodErrors } from "../../../../util";
import { GetSampleRepository } from "../repository";
import { GetSampleParamSchema } from "../schema";
import { GetSampleService } from "../service";
import { GetSampleUseCase } from "../usecase";

/**
 * サンプル取得
 * @route GET /api/v1/sample/:id
 */
const getSampleById = new Hono<AppEnv>().get(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", GetSampleParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = c.get('db');
    const repository = new GetSampleRepository(db);
    const service = new GetSampleService(repository);
    const useCase = new GetSampleUseCase(service);

    const result = await useCase.execute(Number(id));

    if (!result.success) {
      return c.json({ message: result.message }, result.status);
    }

    return c.json({ message: result.message, data: result.data }, result.status);
  }
);

export { getSampleById };

