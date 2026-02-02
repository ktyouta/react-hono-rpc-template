import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, vi, beforeEach, Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMutationWrapper } from "../use-mutation-wrapper";
import { api } from "@/lib/api-client";
import { ReactNode } from "react";
import { AxiosError } from "axios";

// api のモック
vi.mock("@/lib/api-client", () => ({
    api: {
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("useMutationWrapper", () => {

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
                },
                mutations: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    describe("POST method", () => {

        test("should call api.post with correct URL and data", async () => {

            const mockResponse = { data: { id: 1, name: "test" } };
            (api.post as Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(
                () => useMutationWrapper<{ name: string }>({
                    url: "/api/users",
                    method: "POST",
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({ name: "test" });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(api.post).toHaveBeenCalledWith("/api/users", { name: "test" });
        });

        test("should call onSuccess callback on successful POST", async () => {

            const mockResponse = { data: { id: 1 } };
            (api.post as Mock).mockResolvedValue(mockResponse);

            const onSuccess = vi.fn();

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                    onSuccess,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({});
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // onSuccessの第1引数がレスポンスデータであることを確認
            expect(onSuccess).toHaveBeenCalled();
            expect(onSuccess.mock.calls[0][0]).toEqual(mockResponse.data);
        });

        test("should handle null/undefined data", async () => {

            const mockResponse = { data: {} };
            (api.post as Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate(null as unknown as undefined);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(api.post).toHaveBeenCalledWith("/api/users", {});
        });
    });

    describe("PUT method", () => {

        test("should call api.put with correct URL and data", async () => {

            const mockResponse = { data: { id: 1, name: "updated" } };
            (api.put as Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(
                () => useMutationWrapper<{ id: number; name: string }>({
                    url: "/api/users/1",
                    method: "PUT",
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({ id: 1, name: "updated" });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(api.put).toHaveBeenCalledWith("/api/users/1", { id: 1, name: "updated" });
        });
    });

    describe("DELETE method", () => {

        test("should call api.delete with correct URL and data", async () => {

            const mockResponse = { data: { success: true } };
            (api.delete as Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(
                () => useMutationWrapper<{ id: number }>({
                    url: "/api/users/1",
                    method: "DELETE",
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({ id: 1 });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(api.delete).toHaveBeenCalledWith("/api/users/1", { data: { id: 1 } });
        });
    });

    describe("callbacks", () => {

        test("should call onMutate before mutation", async () => {

            (api.post as Mock).mockResolvedValue({ data: {} });

            const onMutate = vi.fn();

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                    onMutate,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({});
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(onMutate).toHaveBeenCalled();
        });

        test("should call onSettled after mutation completes", async () => {

            (api.post as Mock).mockResolvedValue({ data: {} });

            const onSettled = vi.fn();

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                    onSettled,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({});
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(onSettled).toHaveBeenCalled();
        });
    });

    describe("error handling", () => {

        test("should call onError with response data on API error", async () => {

            const errorResponse = { message: "Validation error", errors: ["Invalid name"] };
            const axiosError = new AxiosError("Request failed");
            axiosError.response = {
                data: errorResponse,
                status: 400,
                statusText: "Bad Request",
                headers: {},
                config: {} as any,
            };

            (api.post as Mock).mockRejectedValue(axiosError);

            const onError = vi.fn();

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                    onError,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({});
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(onError).toHaveBeenCalledWith(errorResponse);
        });

        test("should handle error without response data", async () => {

            const axiosError = new AxiosError("Network Error");

            (api.post as Mock).mockRejectedValue(axiosError);

            const onError = vi.fn();

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                    onError,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                result.current.mutate({});
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(onError).toHaveBeenCalledWith(undefined);
        });
    });

    describe("mutation state", () => {

        test("should set isPending during mutation", async () => {

            let resolvePromise: (value: unknown) => void;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (api.post as Mock).mockReturnValue(promise);

            const { result } = renderHook(
                () => useMutationWrapper({
                    url: "/api/users",
                    method: "POST",
                }),
                { wrapper: createWrapper() }
            );

            expect(result.current.isPending).toBe(false);

            act(() => {
                result.current.mutate({});
            });

            // isPendingがtrueになるまで待つ
            await waitFor(() => {
                expect(result.current.isPending).toBe(true);
            });

            await act(async () => {
                resolvePromise!({ data: {} });
            });

            await waitFor(() => {
                expect(result.current.isPending).toBe(false);
            });
        });
    });
});
