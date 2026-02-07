import { and, eq } from "drizzle-orm";
import { FLG } from "../../../constant";
import type { FrontUserId, FrontUserPassword } from "../../../domain";
import type {
  Database,
  FrontUserLoginMaster
} from "../../../infrastructure/db";
import { frontUserLoginMaster } from "../../../infrastructure/db";
import { IFrontUserPasswordRepository } from "./front-user-password.repository.interface";

/**
 * パスワードリポジトリ実装
 */
export class FrontUserPasswordRepository implements IFrontUserPasswordRepository {
  constructor(private readonly db: Database) { }

  /**
   * ログイン情報を取得
   * @param userId ユーザーID
   */
  async getLoginUser(
    userId: FrontUserId
  ): Promise<FrontUserLoginMaster | undefined> {
    const result = await this.db
      .select()
      .from(frontUserLoginMaster)
      .where(
        and(
          eq(frontUserLoginMaster.id, userId.value),
          eq(frontUserLoginMaster.deleteFlg, FLG.OFF)
        )
      );
    return result[0];
  }

  /**
   * ログイン情報を更新
   */
  async updateFrontLoginUser(
    userId: FrontUserId,
    password: FrontUserPassword
  ): Promise<FrontUserLoginMaster | undefined> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(frontUserLoginMaster)
      .set({
        password: password.value,
        updatedAt: now,
      })
      .where(
        and(
          eq(frontUserLoginMaster.id, userId.value),
          eq(frontUserLoginMaster.deleteFlg, FLG.OFF)
        )
      ).returning();;

    return result[0];
  }
}
