import { SetLoginUserContext } from '@/app/components/login-user-provider';
import { paths } from '@/config/paths';
import { useCreateYearList } from '@/hooks/use-create-year-list';
import { LoginUserType } from '@/types/login-user-type';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from '../api/signup';
import { SignupRequestType } from '../types/signup-request-type';
import { useSignupForm } from './use-signup.form';


export function useSignup() {

    // ルーティング用
    const navigate = useNavigate();
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // ログインユーザー情報(setter)
    const setLoginUserInfo = SetLoginUserContext.useCtx();
    // 年リスト
    const yearCoomboList = useCreateYearList();
    // フォーム
    const { register, handleSubmit, formState: { errors }, reset, watch } = useSignupForm();
    // 登録リクエスト
    const postMutation = useSignupMutation({
        // 正常終了後の処理
        onSuccess: (res: unknown) => {
            setLoginUserInfo(res as LoginUserType);
            navigate(paths.home.path);
        },
        // 失敗後の処理
        onError: (message: string) => {

            //エラーメッセージを表示
            setErrMessage(message);

            reset({
                password: ``,
                confirmPassword: ``,
            });
        },
    });

    /**
     * ユーザー登録実行
     */
    const handleConfirm = handleSubmit((data) => {

        const userName = data.userName;
        const password = data.password
        const confirmPassword = data.confirmPassword;

        const body: SignupRequestType = {
            userName,
            password,
            birthday: {
                year: data.birthday.year,
                month: data.birthday.month,
                day: data.birthday.day,
            },
            confirmPassword
        };

        // 登録リクエスト呼び出し
        postMutation.mutate(body);
    });

    /**
     * 戻るボタン押下
     */
    function back() {
        navigate(paths.login.path);
    }

    return {
        errMessage,
        yearCoomboList,
        back,
        isLoading: postMutation.isPending,
        register,
        errors,
        handleConfirm,
        watch,
    }
}