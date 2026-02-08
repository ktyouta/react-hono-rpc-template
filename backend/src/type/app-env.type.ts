import type { EnvBindings, EnvConfig } from "../config";
import type { FrontUserId } from "../domain";
import type { Database } from "../infrastructure/db";

/**
 * フロントユーザー情報型
 */
export type FrontUserInfoType = {
  id: number;
  name: string;
  birthday: string;
};

/**
 * 認証済みユーザー型
 */
export type AuthUserType = {
  userId: FrontUserId;
  info: FrontUserInfoType;
};

/**
 * Honoアプリケーション環境変数の型定義
 */
export type AppEnv = {
  Bindings: EnvBindings;
  Variables: {
    requestId: string;
    user?: AuthUserType;
    db: Database;
    envConfig: EnvConfig;
  };
};
