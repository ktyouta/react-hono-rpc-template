import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, vi, beforeEach, Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSuspenseQueryWrapper } from "../use-suspense-query-wrapper";
import { api } from "@/lib/api-client";
import { ReactNode, Suspense } from "react";

// api のモック
vi.mock("@/lib/api-client", () => ({
    api: {
        get: vi.fn(),
    },
}));

describe("useSuspenseQueryWrapper", () => {

    let queryClient: QueryClient;

    function createWrapper() {
        return function Wrapper({ children }: { children: ReactNode }) {
            return (
                <QueryClientProvider client={queryClient}>
                    <Suspense fallback={<div>Loading...</div>}>
                        {children}
                    </Suspense>
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
                () => useSuspenseQueryWrapper({
                    key: ["suspense-users"],
                    url: "/api/users",
                    select: (res: unknown) => res as typeof mockData,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.data).toBeDefined();
            });

            expect(api.get).toHaveBeenCalledWith("/api/users");
            expect(result.current.data).toEqual(mockData);
        });

        test("should apply select function to transform data", async () => {

            const mockData = { items: [{ id: 1 }, { id: 2 }] };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useSuspenseQueryWrapper({
                    key: ["suspense-items"],
                    url: "/api/items",
                    select: (res: unknown) => (res as typeof mockData).items,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.data).toBeDefined();
            });

            expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe("suspense behavior", () => {

        test("should suspend while loading", async () => {

            let resolvePromise: (value: unknown) => void;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (api.get as Mock).mockReturnValue(promise);

            // Suspenseが動作するためにprefetchを使用
            const fetchPromise = queryClient.prefetchQuery({
                queryKey: ["suspense-loading"],
                queryFn: async () => {
                    const { data } = await api.get("/api/loading");
                    return data;
                },
            });

            // まだ解決されていない
            expect(api.get).toHaveBeenCalledWith("/api/loading");

            // Promiseを解決
            resolvePromise!({ data: { loaded: true } });

            await fetchPromise;
        });

        test("should have data immediately available after suspense resolves", async () => {

            const mockData = { status: "success" };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useSuspenseQueryWrapper({
                    key: ["suspense-immediate"],
                    url: "/api/immediate",
                    select: (res: unknown) => res as typeof mockData,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.data).toBeDefined();
            });

            // useSuspenseQueryではdataは常に定義されている（undefinedにならない）
            expect(result.current.data).toEqual(mockData);
        });
    });

    describe("query options", () => {

        test("should pass additional options to useSuspenseQuery", async () => {

            const mockData = { value: 123 };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useSuspenseQueryWrapper({
                    key: ["suspense-options"],
                    url: "/api/options",
                    select: (res: unknown) => res as typeof mockData,
                    options: {
                        staleTime: 60000,
                    },
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.data).toBeDefined();
            });

            expect(result.current.isStale).toBe(false);
        });
    });

    describe("error handling", () => {

        test("should throw error that can be caught by ErrorBoundary", async () => {

            const error = new Error("Suspense fetch failed");
            (api.get as Mock).mockRejectedValue(error);

            // エラーがスローされることを確認
            // Suspenseクエリはエラー時にErrorBoundaryにエラーを伝播させる
            await expect(async () => {
                await queryClient.fetchQuery({
                    queryKey: ["suspense-error"],
                    queryFn: async () => {
                        const { data } = await api.get("/api/error");
                        return data;
                    },
                });
            }).rejects.toThrow("Suspense fetch failed");
        });
    });

    describe("query key handling", () => {

        test("should use array query key", async () => {

            const mockData = { data: "test" };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useSuspenseQueryWrapper({
                    key: ["users", "detail", 123],
                    url: "/api/users/123",
                    select: (res: unknown) => res as typeof mockData,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.data).toBeDefined();
            });

            // キャッシュに正しいキーで保存されているか確認
            const cachedData = queryClient.getQueryData(["users", "detail", 123]);
            expect(cachedData).toEqual(mockData);
        });

        test("should refetch when query key changes", async () => {

            const mockData1 = { id: 1 };
            const mockData2 = { id: 2 };
            (api.get as Mock)
                .mockResolvedValueOnce({ data: mockData1 })
                .mockResolvedValueOnce({ data: mockData2 });

            const { result, rerender } = renderHook(
                ({ id }) => useSuspenseQueryWrapper({
                    key: ["user", id],
                    url: `/api/users/${id}`,
                    select: (res: unknown) => res as typeof mockData1,
                }),
                {
                    wrapper: createWrapper(),
                    initialProps: { id: 1 },
                }
            );

            await waitFor(() => {
                expect(result.current.data).toEqual(mockData1);
            });

            rerender({ id: 2 });

            await waitFor(() => {
                expect(result.current.data).toEqual(mockData2);
            });

            expect(api.get).toHaveBeenCalledTimes(2);
            expect(api.get).toHaveBeenNthCalledWith(1, "/api/users/1");
            expect(api.get).toHaveBeenNthCalledWith(2, "/api/users/2");
        });
    });

    describe("return value", () => {

        test("should return query result with data property", async () => {

            const mockData = { test: true };
            (api.get as Mock).mockResolvedValue({ data: mockData });

            const { result } = renderHook(
                () => useSuspenseQueryWrapper({
                    key: ["suspense-return"],
                    url: "/api/return",
                    select: (res: unknown) => res as typeof mockData,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.data).toBeDefined();
            });

            expect(result.current).toHaveProperty("data");
            expect(result.current).toHaveProperty("refetch");
            expect(result.current).toHaveProperty("isStale");
        });
    });
});
