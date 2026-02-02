import { api } from '@/lib/api-client';
import { useMutation, type QueryKey } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';

//引数の型
type PropsType = {
    url: string,
    method: methodType,
    queryKey?: QueryKey,
    //処理待ち中の処理
    onMutate?: () => void,
    //処理成功後の処理（バリデーションは呼び出し側で実施）
    onSuccess?: (res: unknown) => void,
    //失敗後の処理（バリデーションは呼び出し側で実施）
    onError?: (res: unknown) => void,
    onSettled?: (res: unknown) => void,
}

//HTTPメソッド
type methodType = "POST" | "PUT" | "DELETE";


export const useMutationWrapper = <T,>(props: PropsType) => {

    //POST
    const postQuery = async (postData: T) => {
        const { data } = await api.post(props.url, postData ?? {});
        return data;
    }

    //PUT
    const putQuery = async (putData: T) => {
        const { data } = await api.put(props.url, putData ?? {});
        return data;
    }

    //DELETE
    const deleteQuery = async (delData: T) => {
        const { data } = await api.delete(props.url, { data: delData ?? {} });
        return data;
    }

    //HTTPメソッドによりaxiosを切り替える
    const queryMethod = useMemo(() => {
        switch (props.method) {
            case "POST":
                return postQuery;
            case "PUT":
                return putQuery;
            case "DELETE":
                return deleteQuery;
            default:
                const _: never = props.method;
        }
    }, [props.url, props.method]);

    return useMutation({
        //HTTPリクエスト送信処理
        mutationFn: queryMethod ? (data: T) => queryMethod(data) : undefined,
        onMutate: props.onMutate ?? undefined,
        onSuccess: props.onSuccess ?? undefined,
        onError: (error: Error) => {
            // AxiosエラーからAPIレスポンスを抽出して渡す
            if (props.onError) {
                const axiosError = error as AxiosError;
                props.onError(axiosError.response?.data);
            }
        },
        onSettled: props.onSettled ?? undefined,
    });
};