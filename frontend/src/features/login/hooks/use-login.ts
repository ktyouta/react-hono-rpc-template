import { LoginUserContext, SetLoginUserContext } from '@/app/components/login-user-provider';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { useQueryParams } from '@/hooks/use-query-params';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../api/login';
import { LoginRequestType } from '../types/login-request-type';
import { useLoginForm } from './use-login-form';


export function useLogin() {

    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // ログインユーザー情報(setter)
    const setLoginUserInfo = SetLoginUserContext.useCtx();
    // フォーム
    const { register, handleSubmit, formState: { errors }, reset } = useLoginForm();
    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();
    // ルーティング用
    const navigate = useNavigate();
    const { appNavigate, appGoBack } = useAppNavigation();
    // リダイレクト先
    const queryParams = useQueryParams();
    const redirectTo = queryParams.redirectTo || paths.home.path;

    /**
     * ログインリクエスト
     */
    const postMutation = useLoginMutation({
        // 正常終了後の処理
        onSuccess: (res) => {
            setLoginUserInfo(res.data.user);
            appNavigate(redirectTo);
        },
        // 失敗後の処理
        onError: (errorMessage: string) => {
            setErrMessage(errorMessage);
            reset({
                name: ``,
                password: ``,
            });
        },
    });

    /**
     * ログインボタン押下
     */
    const clickLogin = handleSubmit((data) => {

        const name = data.name;
        const password = data.password

        const body: LoginRequestType = {
            name,
            password,
        };

        // ログインリクエスト呼び出し
        postMutation.mutate(body);
    });

    /**
     * 前画面に戻る
     */
    function back() {
        appGoBack(paths.home.path);
    }

    return {
        errMessage,
        isLoading: postMutation.isPending,
        register,
        errors,
        clickLogin,
        loginUser,
        back,
        redirectTo,
    }
}