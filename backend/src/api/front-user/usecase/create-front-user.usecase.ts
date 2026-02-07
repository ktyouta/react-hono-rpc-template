import { envConfig } from "../../../config";
import { HTTP_STATUS } from "../../../constant";
import {
    AccessToken,
    FrontUserBirthday,
    FrontUserId,
    FrontUserName,
    FrontUserPassword,
    FrontUserSalt,
    Pepper,
    RefreshToken,
    SeqKey,
    SeqIssue,
} from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { CreateFrontUserResponseDto, type CreateFrontUserResponseType } from "../dto";
import { FrontUserEntity, FrontUserLoginEntity } from "../entity";
import { CreateFrontUserRepository } from "../repository";
import type { CreateFrontUserSchemaType } from "../schema";

type Output =
    | {
        success: true;
        status: 201;
        message: string;
        data: {
            response: CreateFrontUserResponseType;
            refreshToken: string;
        };
    }
    | {
        success: false;
        status: 422;
        message: string;
    };

/**
 * ユーザー作成ユースケース
 */
export class CreateFrontUserUseCase {
    private static readonly SEQ_KEY = "front_user_id";
    private readonly repository: CreateFrontUserRepository;

    constructor(private readonly db: Database) {
        this.repository = new CreateFrontUserRepository(db);
    }

    async execute(requestBody: CreateFrontUserSchemaType): Promise<Output> {
        // ドメインオブジェクトを生成
        const userName = new FrontUserName(requestBody.name);
        const userBirthday = new FrontUserBirthday(requestBody.birthday);
        const salt = FrontUserSalt.generate();
        const pepper = new Pepper(envConfig.pepper);
        const userPassword = await FrontUserPassword.hash(
            requestBody.password,
            salt,
            pepper
        );

        // ユーザー名重複チェック
        const existingUsers = await this.repository.findByUserName(userName);
        if (existingUsers.length > 0) {
            return {
                success: false,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                message: "既にユーザーが存在しています。",
            };
        }

        // ユーザーIDを採番
        const keyModel = new SeqKey(CreateFrontUserUseCase.SEQ_KEY);
        const newId = await SeqIssue.get(keyModel, this.db);
        const frontUserId = FrontUserId.of(newId);

        // ログイン情報を挿入
        const loginUserEntity = new FrontUserLoginEntity(
            frontUserId,
            userName,
            userPassword,
            salt
        );
        await this.repository.insertFrontLoginUser(loginUserEntity);

        // ユーザー情報を挿入
        const userEntity = new FrontUserEntity(frontUserId, userName, userBirthday);
        await this.repository.insertFrontUser(userEntity);

        // トークンを発行
        const accessToken = await AccessToken.create(frontUserId);
        const refreshToken = await RefreshToken.create(frontUserId);

        const responseDto = new CreateFrontUserResponseDto(
            userEntity,
            accessToken.token
        );

        return {
            success: true,
            status: HTTP_STATUS.CREATED,
            message: "ユーザー情報の登録が完了しました。",
            data: {
                response: responseDto.value,
                refreshToken: refreshToken.value,
            },
        };
    }
}
