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

    constructor(private readonly db: Database) {
        this.repository = new UpdateFrontUserRepository(db);
    }

    async execute(
        userId: FrontUserId,
        requestBody: UpdateFrontUserSchemaType
    ): Promise<Output> {
        const userName = new FrontUserName(requestBody.name);
        const userBirthday = new FrontUserBirthday(requestBody.birthday);

        // トランザクション: 重複チェック + ログイン情報更新 + ユーザー情報更新
        const updated = await this.db.transaction(async (tx) => {
            const txRepo = new UpdateFrontUserRepository(tx);

            // ユーザー名重複チェック（自身を除く）
            if (await txRepo.checkUserNameExists(userId, userName)) {
                return { duplicate: true as const };
            }

            // ログイン情報を更新
            await txRepo.updateFrontLoginUser(userId, userName.value);

            // ユーザー情報を更新
            const result = await txRepo.updateFrontUser(
                userId,
                userName.value,
                userBirthday.value
            );

            return { duplicate: false as const, user: result };
        });

        if (updated.duplicate) {
            return {
                success: false,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                message: "既にユーザーが存在しています。",
            };
        }

        if (!updated.user) {
            return {
                success: false,
                status: HTTP_STATUS.NOT_FOUND,
                message: "ユーザーが見つかりません。",
            };
        }

        // 新しいリフレッシュトークンを発行
        const refreshToken = await RefreshToken.create(userId);

        const responseDto = new UpdateFrontUserResponseDto(
            updated.user.id,
            updated.user.name,
            updated.user.birthday
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
