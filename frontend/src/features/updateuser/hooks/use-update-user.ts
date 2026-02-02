import { SetLoginUserContext } from '@/app/components/login-user-provider';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { useCreateYearList } from '@/hooks/use-create-year-list';
import { LoginUserType } from '@/types/login-user-type';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useUpdateUserMutation } from '../api/update-user';
import { UpdateUserRequestType } from '../types/update-user-request-type';
import { useUpdateUserForm } from './use-update-user.form';


export function useUpdateUser() {

    // ルーティング用
    const navigate = useNavigate();
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // ログインユーザー情報(setter)
    const setLoginUserInfo = SetLoginUserContext.useCtx();
    // 年リスト
    const yearCoomboList = useCreateYearList();
    // フォーム
    const { register, handleSubmit, formState: { errors }, reset, watch } = useUpdateUserForm();
    // ルーティング用
    const { appGoBack } = useAppNavigation();
    // 登録リクエスト
    const postMutation = useUpdateUserMutation({
        // 正常終了後の処理
        onSuccess: (res: unknown) => {
            setLoginUserInfo(res as LoginUserType);
            navigate(paths.home.path);
        },
        // 失敗後の処理
        onError: (message: string) => {

            //エラーメッセージを表示
            setErrMessage(message);
        },
    });

    /**
     * ユーザー登録実行
     */
    const handleConfirm = handleSubmit((data) => {

        const body: UpdateUserRequestType = {
            userName: data.userName,
            birthday: {
                year: data.birthday.year,
                month: data.birthday.month,
                day: data.birthday.day,
            },
        };

        // 登録リクエスト呼び出し
        postMutation.mutate(body);
    });

    /**
     * 戻るボタン押下
     */
    function back() {
        appGoBack(paths.home.path);
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