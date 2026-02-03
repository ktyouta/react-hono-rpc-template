import { LoginUserType } from "@/types/login-user-type";
import { createCtx } from "@/utils/create-ctx";
import { ReactNode, useEffect, useState } from "react";
import { veryfy } from "../api/veryfy";

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
        select: (res) => res,
    });

    useEffect(() => {
        if (data && isSuccess && !loginUser) {
            // バックエンドのレスポンス型からログインユーザー情報を取得
            if (data.data) {
                setLoginUser(data.data as LoginUserType);
            }
        }
    }, [data, isSuccess, loginUser]);

    return (
        <LoginUserContext.Provider value={loginUser}>
            <SetLoginUserContext.Provider value={setLoginUser}>
                {props.children}
            </SetLoginUserContext.Provider>
        </LoginUserContext.Provider>
    );
}
