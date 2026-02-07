import type { FrontUserId, FrontUserPassword } from "../../../domain";
import type {
  FrontUserLoginMaster
} from "../../../infrastructure/db";

/**
 * ログインリポジトリインターフェース
 */
export interface IFrontUserPasswordRepository {
  /**
   * ユーザーIDでログイン情報を取得
   * @param userId ユーザーID
   */
  getLoginUser(userId: FrontUserId): Promise<FrontUserLoginMaster | undefined>;

  /**
   * ユーザーIDでログイン情報を取得
   * @param userId ユーザーID
   */
  updateFrontLoginUser(userId: FrontUserId, password: FrontUserPassword): Promise<FrontUserLoginMaster | undefined>;
}
