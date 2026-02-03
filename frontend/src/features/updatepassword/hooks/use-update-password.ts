import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useUpdatePasswordForm } from './use-update-password.form';

// TODO: バックエンドにパスワード更新専用のエンドポイントが存在しない
// UpdateFrontUserSchema には userName と userBirthday のみで、password フィールドがない
// パスワード更新機能を実装する場合は、バックエンドにエンドポイントを追加する必要がある

export function useUpdatePassword() {

    // ルーティング用
    const navigate = useNavigate();
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // フォーム
    const { register, handleSubmit, formState: { errors }, reset } = useUpdatePasswordForm();
    // ルーティング用
    const { appGoBack } = useAppNavigation();
    // ローディング状態
    const [isLoading, setIsLoading] = useState(false);

    /**
     * パスワード更新実行
     */
    const handleConfirm = handleSubmit((_data) => {
        // TODO: バックエンドにパスワード更新エンドポイントを追加後に実装
        setErrMessage('パスワード更新機能は現在利用できません');
        reset({
            password: ``,
            confirmPassword: ``,
        });
    });

    /**
     * 戻るボタン押下
     */
    function back() {
        appGoBack(paths.home.path);
    }

    return {
        errMessage,
        back,
        isLoading,
        register,
        errors,
        handleConfirm,
    }
}