import { MESSAGES } from "@/constants/messages";
import { createApiResponseSchema } from "@/lib/api-response";
import { LoginUserSchema, LoginUserType } from "@/types/login-user-type";
import { createCtx } from "@/utils/create-ctx";
import { ReactNode, useEffect, useState } from "react";
import { veryfy } from "../api/veryfy";

const VeryfiyResponseSchema = createApiResponseSchema(LoginUserSchema);

// ログインユーザー情報
export const LoginUserContext = createCtx<LoginUserType | null>();
// ログインユーザー情報(setter)
export const SetLoginUserContext = createCtx<React.Dispatch<React.SetStateAction<LoginUserType | null>>>();
// 認証チェック中フラグ
export const IsAuthLoadingContext = createCtx<boolean>();

type PropsType = {
    children: ReactNode;
}

export function LoginUserProvider(props: PropsType) {

    // ログインユーザー情報
    const [loginUser, setLoginUser] = useState<LoginUserType | null>(null);

    // 認証チェック
    const { data, isSuccess } = veryfy({
        select: (res: unknown) => {

            if (!res) {
                return null;
            }

            const result = VeryfiyResponseSchema.safeParse(res);
            if (!result.success) {
                console.error(MESSAGES.API_VALIDATION_ERROR, result.error);
                throw new Error(MESSAGES.GENERIC_ERROR);
            }
            return result.data.data;
        }
    });

    useEffect(() => {
        if (data && isSuccess && !loginUser) {
            setLoginUser(data);
        }
    }, [data, isSuccess]);

    return (
        <LoginUserContext.Provider value={loginUser}>
            <SetLoginUserContext.Provider value={setLoginUser}>
                {props.children}
            </SetLoginUserContext.Provider>
        </LoginUserContext.Provider>
    );
}
