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

  constructor(private readonly db: Database) {
    this.repository = new DeleteFrontUserRepository(db);
  }

  async execute(userId: FrontUserId): Promise<Output> {
    // トランザクション: ログイン情報削除 + ユーザー情報削除
    const deleted = await this.db.transaction(async (tx) => {
      const txRepo = new DeleteFrontUserRepository(tx);

      // ログイン情報を削除
      await txRepo.deleteFrontLoginUser(userId);

      // ユーザー情報を削除
      return await txRepo.deleteFrontUser(userId);
    });

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
