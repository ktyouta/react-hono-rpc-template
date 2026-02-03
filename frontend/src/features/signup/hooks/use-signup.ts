import { SetLoginUserContext } from '@/app/components/login-user-provider';
import { paths } from '@/config/paths';
import { useCreateYearList } from '@/hooks/use-create-year-list';
import { LoginUserType } from '@/types/login-user-type';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from '../api/signup';
import { useSignupForm } from './use-signup.form';

/**
 * 生年月日をyyyyMMdd形式に変換
 */
function formatBirthday(birthday: { year: string; month: string; day: string }): string {
    const month = birthday.month.padStart(2, '0');
    const day = birthday.day.padStart(2, '0');
    return `${birthday.year}${month}${day}`;
}

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
        onSuccess: (res) => {
            if (res.data) {
                setLoginUserInfo(res.data as LoginUserType);
            }
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

        // 登録リクエスト呼び出し
        postMutation.mutate({
            userName: data.userName,
            userBirthday: formatBirthday(data.birthday),
            password: data.password,
            confirmPassword: data.confirmPassword,
        });
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