import type { FrontUserId, FrontUserPassword } from "../../../domain";
import type {
  FrontUserLoginMaster
} from "../../../infrastructure/db";
import { IFrontUserPasswordRepository } from "../repository";

/**
 * ログインサービス
 */
export class FrontUserPasswordService {
  constructor(private readonly repository: IFrontUserPasswordRepository) { }

  /**
   * ログイン情報を取得
   */
  async getLoginUser(
    userId: FrontUserId
  ): Promise<FrontUserLoginMaster | undefined> {
    return await this.repository.getLoginUser(userId);
  }

  /**
   * パスワードチェック
   * @param password 
   * @param loginInfo 
   */
  isMatchPassword(password: FrontUserPassword, loginInfo: FrontUserLoginMaster) {

    const encoder = new TextEncoder();
    const encodedInputPassword = encoder.encode(password.value);
    const encodedPassword = encoder.encode(loginInfo.password);

    if (encodedInputPassword.length !== encodedPassword.length) {
      return false;
    }

    if (!crypto.subtle.timingSafeEqual(encodedInputPassword, encodedPassword)) {
      return false;
    }

    return true;
  }

  /**
   * ログイン情報を更新
   * @param userId 
   * @param newPassword 
   */
  async updateFrontLoginUser(userId: FrontUserId, newPassword: FrontUserPassword) {
    const result = await this.repository.updateFrontLoginUser(userId, newPassword);
    return result;
  }
}
