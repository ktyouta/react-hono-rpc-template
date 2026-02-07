import { HTTP_STATUS } from "../../../constant";
import {
    FrontUserBirthday,
    FrontUserId,
    FrontUserName,
    RefreshToken,
} from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { UpdateFrontUserResponseDto, type UpdateFrontUserResponseType } from "../dto";
import { UpdateFrontUserRepository } from "../repository";
import type { UpdateFrontUserSchemaType } from "../schema";

type Output =
    | {
        success: true;
        status: 200;
        message: string;
        data: {
            response: UpdateFrontUserResponseType;
            refreshToken: string;
        };
    }
    | {
        success: false;
        status: 404 | 422;
        message: string;
    };

/**
 * ユーザー更新ユースケース
 */
export class UpdateFrontUserUseCase {
    private readonly repository: UpdateFrontUserRepository;

    constructor(db: Database) {
        this.repository = new UpdateFrontUserRepository(db);
    }

    async execute(
        userId: FrontUserId,
        requestBody: UpdateFrontUserSchemaType
    ): Promise<Output> {
        const userName = new FrontUserName(requestBody.name);
        const userBirthday = new FrontUserBirthday(requestBody.birthday);

        // ユーザー名重複チェック（自身を除く）
        if (await this.repository.checkUserNameExists(userId, userName)) {
            return {
                success: false,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                message: "既にユーザーが存在しています。",
            };
        }

        // ログイン情報を更新
        await this.repository.updateFrontLoginUser(userId, userName.value);

        // ユーザー情報を更新
        const updated = await this.repository.updateFrontUser(
            userId,
            userName.value,
            userBirthday.value
        );

        if (!updated) {
            return {
                success: false,
                status: HTTP_STATUS.NOT_FOUND,
                message: "ユーザーが見つかりません。",
            };
        }

        // 新しいリフレッシュトークンを発行
        const refreshToken = await RefreshToken.create(userId);

        const responseDto = new UpdateFrontUserResponseDto(
            updated.id,
            updated.name,
            updated.birthday
        );

        return {
            success: true,
            status: HTTP_STATUS.OK,
            message: "ユーザー情報の更新が完了しました。",
            data: {
                response: responseDto.value,
                refreshToken: refreshToken.value,
            },
        };
    }
}
