import { paths } from "@/config/paths";
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoginUserContext } from "./login-user-provider";

type PropsType = {
    children: ReactNode;
}

export function GuestRoute(props: PropsType) {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();

    if (loginUser) {
        return (
            <Navigate
                to={paths.home.path}
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

