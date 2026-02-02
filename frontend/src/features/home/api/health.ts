import { rpc } from '@/lib/rpc-client';
import { useQuery } from '@tanstack/react-query';

/**
 * ヘルスチェックAPIのレスポンス型
 */
type HealthResponse = {
  status: number;
  message: string;
  data: {
    status: string;
    timestamp: string;
  };
};

/**
 * ヘルスチェックAPI呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出しのサンプル
 */
export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await rpc.api.v1.health.$get();
      if (!res.ok) {
        throw new Error('Health check failed');
      }
      const data = await res.json() as HealthResponse;
      return data;
    },
  });
}
