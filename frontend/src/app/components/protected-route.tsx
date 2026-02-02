import { paths } from "@/config/paths";
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoginUserContext } from "./login-user-provider";

type PropsType = {
    children: ReactNode;
}

export function ProtectedRoute(props: PropsType) {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();
    // パス取得用
    const location = useLocation();

    if (!loginUser) {
        return (
            <Navigate
                to={paths.login.getHref(location.pathname)}
                replace
            />
        );
    }

    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    );
}

