import { hc } from 'hono/client';
import type { AppType } from '@backend/index';
import { env } from '@/config/env';

/**
 * Hono RPC クライアント
 * バックエンドの型定義から型安全なAPIクライアントを生成
 */
export const rpc = hc<AppType>(env.API_URL, {
  init: {
    credentials: 'include',
  },
});

/**
 * RPC クライアントの型
 */
export type RpcClient = typeof rpc;
