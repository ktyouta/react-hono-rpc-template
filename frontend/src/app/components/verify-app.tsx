import { ReactNode } from "react";
import { LoginUserType, verify } from "../api/verify";

type ChildrenPropsTYpe = {
    user: LoginUserType | null
}

type PropsType = {
    children: (props: ChildrenPropsTYpe) => ReactNode;
}

export function VerifyApp(props: PropsType) {

    // 認証チェック
    const { data } = verify();
    return props.children({
        user: data ? data.data.userInfo : null
    });
}