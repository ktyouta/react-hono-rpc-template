import { api } from '@/lib/api-client';
import { QueryKey, useSuspenseQuery, UseSuspenseQueryOptions } from '@tanstack/react-query';

type PropsType<T> = {
    key: QueryKey,
    url: string,
    select: (res: unknown) => T,
    options?: Omit<
        UseSuspenseQueryOptions<unknown, Error, T, QueryKey>,
        'queryKey' | 'queryFn' | 'select'
    >,
}

export const useSuspenseQueryWrapper = <T>(props: PropsType<T>) => {

    const getQuery = async () => {
        const { data } = await api.get(props.url);
        return data;
    }

    return useSuspenseQuery({
        queryKey: props.key,
        queryFn: getQuery,
        select: props.select,
        ...props.options,
    });
};
