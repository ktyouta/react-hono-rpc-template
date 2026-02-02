import { apiPaths } from "@/config/api-paths";
import { api } from "@/lib/api-client";
import { LoginUserType } from "@/types/login-user-type";
import { useSuspenseQuery } from "@tanstack/react-query";
import { veryfyKeys } from "./query-key";

type PropsType = {
    select: (res: unknown) => LoginUserType | null,
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
                const { data } = await api.get(apiPaths.verify);
                return data;
            } catch (error) {
                return null;
            }
        },
        select: props.select,
    });
}