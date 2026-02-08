# React + Hono RPC Template

JWT 認証付きのフルスタックテンプレート。React フロントエンドと Hono バックエンドを Hono RPC で型安全に連携する。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19, Vite, TanStack Query, React Hook Form, Tailwind CSS |
| バックエンド | Hono, Cloudflare Workers, D1 (SQLite), Drizzle ORM |
| 通信 | Hono RPC（型安全） |
| 認証 | JWT（アクセストークン + リフレッシュトークン） |
| テスト | Vitest, Storybook |

## ディレクトリ構成

```
react-hono-rpc-template/
├── backend/                  # Hono バックエンド（Cloudflare Workers）
│   ├── src/
│   │   ├── api/              # エンドポイント（controller / repository / service / dto）
│   │   ├── config/           # 環境変数設定（EnvConfig）
│   │   ├── domain/           # ドメインオブジェクト（AccessToken, RefreshToken 等）
│   │   ├── infrastructure/   # DB スキーマ定義（Drizzle ORM）
│   │   ├── middleware/       # ミドルウェア（認証, CORS, ログ等）
│   │   └── index.ts          # エントリポイント、AppType エクスポート
│   ├── drizzle/              # マイグレーションファイル（drizzle-kit generate 出力先）
│   ├── seed/                 # Seed データ
│   ├── test/                 # テスト
│   ├── wrangler.jsonc        # Wrangler 設定（ローカル / 本番）
│   └── drizzle.config.ts     # Drizzle Kit 設定
├── frontend/                 # React フロントエンド（Vite）
│   ├── src/
│   │   ├── components/       # 共通 UI コンポーネント
│   │   ├── features/         # 機能別モジュール（home, login, sample 等）
│   │   ├── lib/              # RPC クライアント等
│   │   └── testing/          # テストセットアップ
│   └── .storybook/           # Storybook 設定
└── package.json              # ルート（npm workspaces）
```

## クイックスタート

### 1. 依存パッケージのインストール

```bash
npm install
```

ルートの `package.json` で npm workspaces を使用しているため、ルートで `npm install` を実行すれば frontend / backend 両方の依存がインストールされる。

### 2. バックエンドの環境変数設定

`backend/.dev.vars` を作成し、以下を設定する:

```
ACCESS_TOKEN_JWT_KEY=<アクセストークン用の秘密鍵>
REFRESH_TOKEN_JWT_KEY=<リフレッシュトークン用の秘密鍵>
PEPPER=<パスワードハッシュ用のペッパー値>
```

`wrangler.jsonc` の `vars` に定義された値（トークン有効期限、CORS 等）はローカル開発用のデフォルトが設定済み。

### 3. データベースのセットアップ

```bash
cd backend

# マイグレーションファイルを生成（スキーマ変更時）
npm run db:generate

# ローカル D1 にマイグレーション適用
npm run db:migrate:local

# Seed データ投入（任意）
npm run db:seed:local
```

### 4. 開発サーバー起動

ターミナルを 2 つ開き、それぞれ実行する:

```bash
# バックエンド（http://localhost:8787）
cd backend
npm run dev

# フロントエンド（http://localhost:5173）
cd frontend
npm run dev
```

## データベース

Cloudflare D1（SQLite ベース）を使用し、Drizzle ORM でスキーマ管理する。

- **スキーマ定義**: `backend/src/infrastructure/db/schema.ts`
- **マイグレーション出力先**: `backend/drizzle/`
- **Seed データ**: `backend/seed/seed.sql`

### マイグレーションコマンド

| コマンド | 説明 |
|---|---|
| `npm run db:generate` | スキーマ変更からマイグレーション SQL を生成 |
| `npm run db:migrate:local` | ローカル D1 にマイグレーション適用 |
| `npm run db:migrate:prod` | 本番 D1 にマイグレーション適用（リモート） |
| `npm run db:seed:local` | ローカル D1 に Seed データ投入 |

## デプロイ

### バックエンド（Cloudflare Workers）

`wrangler.jsonc` に `env.production` セクションが定義されている。

```bash
cd backend

# 1. 本番用シークレットを設定（初回のみ）
npx wrangler secret put ACCESS_TOKEN_JWT_KEY --env production
npx wrangler secret put REFRESH_TOKEN_JWT_KEY --env production
npx wrangler secret put PEPPER --env production

# 2. wrangler.jsonc の production セクションを編集
#    - database_id: Cloudflare ダッシュボードで D1 データベースを作成し、その ID を設定
#    - CORS_ORIGIN: フロントエンドのデプロイ先 URL を設定

# 3. 本番 D1 にマイグレーション適用
npm run db:migrate:prod

# 4. デプロイ
npm run deploy:prod
```

### フロントエンド（Cloudflare Pages）

```bash
cd frontend
npm run build
# dist/ ディレクトリを Cloudflare Pages にデプロイ
```

Pages のデプロイは Cloudflare ダッシュボードから GitHub 連携、または `npx wrangler pages deploy dist` で実行する。

## 主要スクリプト一覧

### バックエンド (`backend/`)

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run test` | テスト実行 |
| `npm run deploy:prod` | 本番環境にデプロイ |
| `npm run db:generate` | マイグレーション SQL 生成 |
| `npm run db:migrate:local` | ローカル DB にマイグレーション適用 |
| `npm run db:migrate:prod` | 本番 DB にマイグレーション適用 |
| `npm run db:seed:local` | ローカル DB に Seed データ投入 |

### フロントエンド (`frontend/`)

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run test` | テスト実行 |
| `npm run storybook` | Storybook 起動 |
| `npm run build-storybook` | Storybook ビルド |

## RPC 設計方針

- バックエンドは REST API の URL 設計を前提とする
- フロントエンドは URL や HTTP メソッドを意識しない（RPC クライアント経由で呼び出す）
- RPC の型定義は**バックエンドを単一の source of truth** とする
- フロントエンドで API 用の型を新規定義しない
- `InferResponseType` / `InferRequestType` で型推論し、`as` による型アサーションを使用しない

### 型安全な API 呼び出しの例

```typescript
// フロントエンド側
import { rpc } from '@/lib/rpc-client';

// 型安全な API 呼び出し（IDE で補完が効く）
const res = await rpc.api.v1.health.$get();
const data = await res.json();
```

## 設計上の補足

### ルート package.json の hono 依存

ルートの `package.json` に `hono` が `devDependencies` として存在する。これはフロントエンドの TypeScript コンパイラが RPC 型チェーン（`AppType`）を解決する際にバックエンドの Hono 型定義を参照する必要があるため。ルートに配置することで、フロントエンドの `tsc` がバックエンドの型を正しく解決できる。

### Zod バージョンが分かれている理由

- **フロントエンド**: Zod v4（`@hookform/resolvers@5.x` が Zod v4 のみ対応）
- **バックエンド**: Zod v3（`@hono/zod-validator@0.4.x` が Zod v3 のみ対応）

両者のバリデーションスキーマは RPC を通じて直接共有しないため、バージョンの違いは実行時に問題を起こさない。将来的に `@hono/zod-validator` が Zod v4 に対応した時点で統一可能。

### バックエンドの import パス

バックエンドでは `@/` パスエイリアスを使用せず、相対パス（`../../../domain` 等）で import する。フロントエンドの `tsconfig` が `@/*` を `frontend/src/*` にマッピングしているため、RPC 型チェーンでバックエンドファイルを処理する際に誤解決される問題を防止するため。
