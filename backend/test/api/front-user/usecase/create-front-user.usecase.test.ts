import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateFrontUserUseCase } from "../../../../src/api/front-user/usecase/create-front-user.usecase";
import { HTTP_STATUS } from "../../../../src/constant";
import { FrontUserId } from "../../../../src/domain";
import type { Database } from "../../../../src/infrastructure/db";


// モック
vi.mock("../../../../src/api/front-user/repository", () => ({
    CreateFrontUserRepository: vi.fn().mockImplementation(() => ({
        findByUserName: vi.fn(),
        insertFrontUser: vi.fn(),
        insertFrontLoginUser: vi.fn(),
    })),
}));

vi.mock("../../../../src/config", () => ({
    envConfig: {
        pepper: "test-pepper",
        accessTokenJwtKey: "test-access-key",
        accessTokenExpires: "1h",
        refreshTokenJwtKey: "test-refresh-key",
        refreshTokenExpires: "7d",
    },
}));

vi.mock("../../../../src/domain/access-token/access-token", () => ({
    AccessToken: {
        create: vi.fn().mockResolvedValue({ token: "mock-access-token" }),
    },
}));

vi.mock("../../../../src/domain/refresh-token/refresh-token", () => ({
    RefreshToken: {
        create: vi.fn().mockResolvedValue({ value: "mock-refresh-token" }),
    },
}));

vi.mock("../../../../src/domain/front-user-password/front-user-password", () => ({
    FrontUserPassword: {
        hash: vi.fn().mockResolvedValue({ value: "hashed-password" }),
    },
}));

vi.mock("../../../../src/domain/front-user-salt/front-user-salt", () => ({
    FrontUserSalt: {
        generate: vi.fn().mockReturnValue({ value: "generated-salt" }),
    },
}));

vi.mock("../../../../src/domain/seq/seq", () => ({
    SeqKey: vi.fn().mockImplementation((key: string) => ({ key })),
    SeqIssue: {
        get: vi.fn().mockResolvedValue(1),
    },
}));


describe("CreateFrontUserUseCase", () => {

    let mockDb: Database;
    let useCase: CreateFrontUserUseCase;

    const validRequestBody = {
        userName: "testuser",
        password: "password123",
        userBirthday: "19900101",
        confirmPassword: "password123",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new CreateFrontUserUseCase(mockDb);
    });

    describe("execute", () => {

        it("正常系: ユーザー作成に成功する", async () => {
            // Arrange
            const mockRepository = (useCase as any).repository;
            mockRepository.findByUserName = vi.fn().mockResolvedValue([]);
            mockRepository.insertFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockRepository.insertFrontUser = vi.fn().mockResolvedValue({
                userId: 1,
                userName: "testuser",
                userBirthday: "19900101",
            });

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.CREATED);
            expect(result.message).toBe("ユーザー情報の登録が完了しました。");
            if (result.success) {
                expect(result.data.response).toBeDefined();
                expect(result.data.refreshToken).toBe("mock-refresh-token");
            }
        });

        it("異常系: ユーザー名が重複している場合はエラーを返す", async () => {
            // Arrange
            const mockRepository = (useCase as any).repository;
            mockRepository.findByUserName = vi.fn().mockResolvedValue([{ userId: 1 }]);

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
            expect(result.message).toBe("既にユーザーが存在しています。");
        });
    });
});
