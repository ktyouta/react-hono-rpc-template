import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateFrontUserUseCase } from "../../../../src/api/front-user/usecase/update-front-user.usecase";
import { UpdateFrontUserRepository } from "../../../../src/api/front-user/repository";
import { HTTP_STATUS } from "../../../../src/constant";
import { FrontUserId } from "../../../../src/domain";
import type { Database } from "../../../../src/infrastructure/db";


// モック
vi.mock("../../../../src/api/front-user/repository", () => ({
    UpdateFrontUserRepository: vi.fn().mockImplementation(() => ({
        checkUserNameExists: vi.fn(),
        updateFrontLoginUser: vi.fn(),
        updateFrontUser: vi.fn(),
    })),
}));

vi.mock("../../../../src/config", () => ({
    envConfig: {
        refreshTokenJwtKey: "test-refresh-key",
        refreshTokenExpires: "7d",
    },
}));

vi.mock("../../../../src/domain/refresh-token/refresh-token", () => ({
    RefreshToken: {
        create: vi.fn().mockResolvedValue({ value: "mock-refresh-token" }),
    },
}));


describe("UpdateFrontUserUseCase", () => {

    let mockDb: Database;
    let useCase: UpdateFrontUserUseCase;

    const validUserId = FrontUserId.of(1);
    const validRequestBody = {
        name: "updateduser",
        birthday: "19900101",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {
            transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockDb)),
        } as unknown as Database;
        useCase = new UpdateFrontUserUseCase(mockDb);
        // トランザクション内で生成されるリポジトリも同一インスタンスを返すようにする
        vi.mocked(UpdateFrontUserRepository).mockImplementation(() => (useCase as any).repository);
    });

    describe("execute", () => {

        it("正常系: ユーザー更新に成功する", async () => {
            // Arrange
            const mockRepository = (useCase as any).repository;
            mockRepository.checkUserNameExists = vi.fn().mockResolvedValue(false);
            mockRepository.updateFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockRepository.updateFrontUser = vi.fn().mockResolvedValue({
                id: 1,
                name: "updateduser",
                birthday: "19900101",
            });

            // Act
            const result = await useCase.execute(validUserId, validRequestBody);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("ユーザー情報の更新が完了しました。");
            if (result.success) {
                expect(result.data.response).toBeDefined();
                expect(result.data.refreshToken).toBe("mock-refresh-token");
            }
        });

        it("異常系: ユーザー名が重複している場合はエラーを返す", async () => {
            // Arrange
            const mockRepository = (useCase as any).repository;
            mockRepository.checkUserNameExists = vi.fn().mockResolvedValue(true);

            // Act
            const result = await useCase.execute(validUserId, validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
            expect(result.message).toBe("既にユーザーが存在しています。");
        });

        it("異常系: ユーザーが見つからない場合はエラーを返す", async () => {
            // Arrange
            const mockRepository = (useCase as any).repository;
            mockRepository.checkUserNameExists = vi.fn().mockResolvedValue(false);
            mockRepository.updateFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockRepository.updateFrontUser = vi.fn().mockResolvedValue(null);

            // Act
            const result = await useCase.execute(validUserId, validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(result.message).toBe("ユーザーが見つかりません。");
        });
    });
});
