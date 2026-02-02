import { LoginUserContext, SetLoginUserContext } from '@/app/components/login-user-provider';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { LoginUserType } from '@/types/login-user-type';
import { useState } from 'react';
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
    const { appGoBack } = useAppNavigation();

    /**
     * ログインリクエスト
     */
    const postMutation = useLoginMutation({
        // 正常終了後の処理
        onSuccess: (res: unknown) => {
            setLoginUserInfo(res as LoginUserType);
        },
        // 失敗後の処理
        onError: (errorMessage: string) => {
            setErrMessage(errorMessage);
            reset({
                userName: ``,
                password: ``,
            });
        },
    });

    /**
     * ログインボタン押下
     */
    const clickLogin = handleSubmit((data) => {

        const userName = data.userName;
        const password = data.password

        const body: LoginRequestType = {
            userName,
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
    }
}