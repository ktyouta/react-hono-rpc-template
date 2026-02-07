import { envConfig } from "../../../config";
import { HTTP_STATUS } from "../../../constant";
import {
    FrontUserId,
    FrontUserPassword,
    FrontUserSalt,
    Pepper
} from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { FrontUserPasswordRepository } from "../repository";
import { FrontUserPasswordSchemaType } from "../schema";
import { FrontUserPasswordService } from "../service/front-user-password.service";

type Output =
    | {
        success: true;
        status: 200;
        message: string;
    }
    | {
        success: false;
        status: 401;
        message: string;
    };

/**
 * パスワード更新ユースケース
 */
export class FrontUserPasswordUseCase {
    private readonly service: FrontUserPasswordService;

    constructor(db: Database) {
        const repository = new FrontUserPasswordRepository(db);
        this.service = new FrontUserPasswordService(repository);
    }

    private failed(): Output {
        return {
            success: false,
            status: HTTP_STATUS.UNAUTHORIZED,
            message: "パスワードの更新に失敗しました。",
        };
    }

    async execute(
        userId: FrontUserId,
        requestBody: FrontUserPasswordSchemaType
    ): Promise<Output> {

        // ユーザー情報を取得
        const loginInfo = await this.service.getLoginUser(userId);

        if (!loginInfo) {
            return this.failed();
        }

        // パスワード検証
        const pepper = new Pepper(envConfig.pepper);
        const salt = FrontUserSalt.of(loginInfo.salt);
        const nowPassword = await FrontUserPassword.hash(
            requestBody.nowPassword,
            salt,
            pepper
        );

        if (this.service.isMatchPassword(nowPassword, loginInfo)) {
            return this.failed();
        }

        // パスワード更新
        const updateResult = await this.service.updateFrontLoginUser(userId, await FrontUserPassword.hash(
            requestBody.newPassword,
            salt,
            pepper,
        ));

        if (!updateResult) {
            return this.failed();
        }

        return {
            success: true,
            status: HTTP_STATUS.OK,
            message: "パスワードの更新に成功しました。"
        };
    }
}
