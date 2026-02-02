# React + Hono RPC Template

React フロントエンドと Hono バックエンドを RPC（型安全通信）で連携するテンプレート。

## 構成

```
react-hono-rpc-template/
├── backend/    # Hono バックエンド（Cloudflare Workers）
└── frontend/   # React フロントエンド（Vite）
```

## RPC 方針

- REST API のような URL 設計をフロントに意識させない
- RPC の型定義はバックエンドを単一の source of truth とする
- フロントエンドでは API 用の型を新規定義しない
- Hono の app 定義から RPC クライアントを生成

## セットアップ

### バックエンド

```bash
cd backend
npm install
npm run dev
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## 主要ファイル

### バックエンド

- `src/index.ts` - アプリケーションエントリ、`AppType` をエクスポート
- `src/api/` - 各エンドポイントの実装

### フロントエンド

- `src/lib/rpc-client.ts` - Hono RPC クライアント
- `src/features/home/api/health.ts` - RPC 呼び出しサンプル

## 型安全な API 呼び出しの例

```typescript
// フロントエンド側
import { rpc } from '@/lib/rpc-client';

// 型安全な API 呼び出し（IDE で補完が効く）
const res = await rpc.api.v1.health.$get();
const data = await res.json();
```

## 注意事項

- フロントエンドから `fetch` や `axios` を直接使用しない
- API の型定義はバックエンド側で行い、フロントエンドでは import のみ
