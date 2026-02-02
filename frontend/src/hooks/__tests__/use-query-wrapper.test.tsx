import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, vi, beforeEach, Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQueryWrapper } from "../use-query-wrapper";
import { api } from "@/lib/api-client";
import { ReactNode } from "react";

// api のモック
vi.mock("@/lib/api-client", () => ({
    api: {
        get: vi.fn(),
    },
}));

describe("useQueryWrapper", () => {

    let queryClient: QueryClient;

    function createWrapper() {
        return function Wrapper({ children }: { children: ReactNode }) {
            return (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            );
        };
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
            },
        });
        vi.clearAllMocks();
    });

    describe("data fetching", () => {

        test("should fetch data with correct URL", async () => {

            const mockData = { users: [{ id: 1, name: "Test" }] };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useQueryWrapper({
                    key: ["users"],
                    url: "/api/users",
                    select: (res: unknown) => res as typeof mockData,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(api.get).toHaveBeenCalledWith("/api/users");
            expect(result.current.data).toEqual(mockData);
        });

        test("should apply select function to transform data", async () => {

            const mockData = { users: [{ id: 1, name: "Test" }] };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useQueryWrapper({
                    key: ["users"],
                    url: "/api/users",
                    select: (res: unknown) => (res as typeof mockData).users,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([{ id: 1, name: "Test" }]);
        });
    });

    describe("callbacks", () => {

        test("should call onSuccess when data is fetched successfully", async () => {

            const mockData = { id: 1 };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const onSuccess = vi.fn();

            renderHook(
                () => useQueryWrapper({
                    key: ["test"],
                    url: "/api/test",
                    select: (res: unknown) => res as typeof mockData,
                    onSuccess,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(mockData);
            });
        });

        test("should call onError when fetch fails", async () => {

            const error = new Error("Network Error");
            (api.get as Mock).mockRejectedValue(error);

            const onError = vi.fn();

            renderHook(
                () => useQueryWrapper({
                    key: ["test-error"],
                    url: "/api/test",
                    select: (res: unknown) => res,
                    onError,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(error);
            });
        });

        test("should use ref to avoid stale closure for callbacks", async () => {

            const mockData = { id: 1 };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const onSuccess1 = vi.fn();
            const onSuccess2 = vi.fn();

            const { rerender } = renderHook(
                ({ onSuccess }) => useQueryWrapper({
                    key: ["test-ref"],
                    url: "/api/test",
                    select: (res: unknown) => res as typeof mockData,
                    onSuccess,
                }),
                {
                    wrapper: createWrapper(),
                    initialProps: { onSuccess: onSuccess1 },
                }
            );

            // 最初のonSuccessが呼ばれる
            await waitFor(() => {
                expect(onSuccess1).toHaveBeenCalled();
            });

            // コールバックを変更
            rerender({ onSuccess: onSuccess2 });

            // データを無効化して再フェッチ
            await queryClient.invalidateQueries({ queryKey: ["test-ref"] });

            await waitFor(() => {
                expect(onSuccess2).toHaveBeenCalled();
            });
        });
    });

    describe("enabled option", () => {

        test("should not fetch when enabled is false", async () => {

            const { result } = renderHook(
                () => useQueryWrapper({
                    key: ["disabled"],
                    url: "/api/disabled",
                    select: (res: unknown) => res,
                    enabled: false,
                }),
                { wrapper: createWrapper() }
            );

            // クエリが実行されていないことを確認
            expect(api.get).not.toHaveBeenCalled();
            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe("idle");
        });

        test("should fetch when enabled is true (default)", async () => {

            (api.get as Mock).mockResolvedValue({ data: {} });

            renderHook(
                () => useQueryWrapper({
                    key: ["enabled"],
                    url: "/api/enabled",
                    select: (res: unknown) => res,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });

        test("should fetch when enabled changes from false to true", async () => {

            (api.get as Mock).mockResolvedValue({ data: { id: 1 } });

            const { result, rerender } = renderHook(
                ({ enabled }) => useQueryWrapper({
                    key: ["toggle"],
                    url: "/api/toggle",
                    select: (res: unknown) => res,
                    enabled,
                }),
                {
                    wrapper: createWrapper(),
                    initialProps: { enabled: false },
                }
            );

            expect(api.get).not.toHaveBeenCalled();

            rerender({ enabled: true });

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    describe("query options", () => {

        test("should pass additional options to useQuery", async () => {

            (api.get as Mock).mockResolvedValue({ data: { stale: true } });

            const { result } = renderHook(
                () => useQueryWrapper({
                    key: ["with-options"],
                    url: "/api/options",
                    select: (res: unknown) => res,
                    options: {
                        staleTime: 60000,
                    },
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // staleTimeが適用されているか確認
            expect(result.current.isStale).toBe(false);
        });
    });

    describe("query state", () => {

        test("should return loading state initially", () => {

            let resolvePromise: (value: unknown) => void;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (api.get as Mock).mockReturnValue(promise);

            const { result } = renderHook(
                () => useQueryWrapper({
                    key: ["loading"],
                    url: "/api/loading",
                    select: (res: unknown) => res,
                }),
                { wrapper: createWrapper() }
            );

            expect(result.current.isPending).toBe(true);
            expect(result.current.isSuccess).toBe(false);
        });

        test("should return error state on failure", async () => {

            const error = new Error("Fetch failed");
            (api.get as Mock).mockRejectedValue(error);

            const { result } = renderHook(
                () => useQueryWrapper({
                    key: ["error-state"],
                    url: "/api/error",
                    select: (res: unknown) => res,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBe(error);
        });
    });
});
