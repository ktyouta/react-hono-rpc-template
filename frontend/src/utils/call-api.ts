import { api } from "@/lib/api-client";

type ApiCallOptions<T> = {
    method: "POST" | "PUT" | "DELETE";
    url: string;
    body?: T;
    onSuccess?: (res: unknown) => void;
    onError?: (err: unknown) => void;
    onFinally?: () => void;
};


export function callApi<T>({ method, url, body, onSuccess, onError, onFinally }: ApiCallOptions<T>) {

    let req: Promise<unknown>;

    switch (method) {
        case "POST":
            req = api.post(url, body);
            break;
        case "PUT":
            req = api.put(url, body);
            break;
        case "DELETE":
            req = api.delete(url, { data: body });
            break;
        default:
            throw new Error(`Unsupported method: ${method}`);
    }

    return req
        .then(res => onSuccess?.(res))
        .catch(err => onError?.(err))
        .finally(() => onFinally?.());
}
