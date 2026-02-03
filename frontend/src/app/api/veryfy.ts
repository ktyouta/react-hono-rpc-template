import { rpc } from "@/lib/rpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { veryfyKeys } from "./query-key";
import type { InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1.verify.$get;

type ResponseType = InferResponseType<typeof endpoint>;

type PropsType = {
    select: (res: ResponseType | null) => ResponseType | null,
}

/**
 * 認証チェック
 * @param props
 * @returns
 */
export function veryfy(props: PropsType) {

    return useSuspenseQuery({
        queryKey: veryfyKeys.all,
        queryFn: async () => {
            try {
                const res = await endpoint();
                if (!res.ok) {
                    return null;
                }
                return res.json();
            } catch {
                return null;
            }
        },
        select: props.select,
    });
}