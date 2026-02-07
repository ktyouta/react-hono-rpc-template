import { Hono } from "hono";
import { API_ENDPOINT } from "../../../../constant";
import type { AppEnv } from "../../../../type";
import { GetListSampleRepository } from "../repository";
import { GetListSampleService } from "../service";
import { GetListSampleUseCase } from "../usecase";

/**
 * サンプル一覧取得
 * @route GET /api/v1/sample
 */
const getListSample = new Hono<AppEnv>().get(API_ENDPOINT.SAMPLE, async (c) => {
  const db = c.get('db');
  const repository = new GetListSampleRepository(db);
  const service = new GetListSampleService(repository);
  const useCase = new GetListSampleUseCase(service);

  const result = await useCase.execute();

  return c.json({ message: result.message, data: result.data }, result.status);
});

export { getListSample };

