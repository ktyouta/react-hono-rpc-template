import { HTTP_STATUS } from "../../../constant";
import { FrontUserId } from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { DeleteFrontUserRepository } from "../repository";

type Output =
  | {
    success: true;
    message: string;
  }
  | {
    success: false;
    status: typeof HTTP_STATUS.NOT_FOUND;
    message: string;
  };

/**
 * ユーザー削除ユースケース
 */
export class DeleteFrontUserUseCase {
  private readonly repository: DeleteFrontUserRepository;

  constructor(db: Database) {
    this.repository = new DeleteFrontUserRepository(db);
  }

  async execute(userId: FrontUserId): Promise<Output> {
    // ログイン情報を削除
    await this.repository.deleteFrontLoginUser(userId);

    // ユーザー情報を削除
    const deleted = await this.repository.deleteFrontUser(userId);

    if (!deleted) {
      return {
        success: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "ユーザーが見つかりません。",
      };
    }

    return {
      success: true,
      message: "ユーザーの削除が完了しました。",
    };
  }
}
