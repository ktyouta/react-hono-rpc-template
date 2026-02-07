import { createCtx } from "@/utils/create-ctx";
import { ReactNode, useEffect, useState } from "react";
import { LoginUserType, verify } from "../api/verify";

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
    const { data, isSuccess } = verify();

    useEffect(() => {
        if (data && !loginUser) {
            setLoginUser({
                id: data.data.userInfo.id,
                name: data.data.userInfo.name,
                birthday: data.data.userInfo.birthday,
            });
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
