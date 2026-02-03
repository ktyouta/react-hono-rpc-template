import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferResponseType, InferRequestType } from 'hono/client';

const endpoint = rpc.api.v1.frontuser.$post;

type ResponseType = InferResponseType<typeof endpoint>;
type RequestType = InferRequestType<typeof endpoint>['json'];

type PropsType = {
    onSuccess: (data: ResponseType) => void;
    onError: (message: string) => void;
};

export function useSignupMutation(props: PropsType) {
    return useMutation({
        mutationFn: async (data: RequestType) => {
            const res = await endpoint({ json: data });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: props.onSuccess,
        onError: (error: Error) => {
            props.onError(error.message);
        },
    });
}