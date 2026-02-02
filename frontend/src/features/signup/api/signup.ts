import { apiPaths } from '@/config/api-paths';
import { MESSAGES } from '@/constants/messages';
import { useMutationWrapper } from '@/hooks/use-mutation-wrapper';
import { ApiErrorResponseSchema, createApiResponseSchema } from '@/lib/api-response';
import { LoginUserSchema, LoginUserType } from '@/types/login-user-type';

const SignupResponseSchema = createApiResponseSchema(LoginUserSchema);

type PropsType = {
    onSuccess: (data: LoginUserType) => void;
    onError: (message: string) => void;
};

export function useSignupMutation(props: PropsType) {

    return useMutationWrapper({
        url: apiPaths.signup,
        method: "POST",
        onSuccess: (res: unknown) => {
            const result = SignupResponseSchema.safeParse(res);
            if (!result.success) {
                console.error(MESSAGES.API_VALIDATION_ERROR, result.error);
                props.onError(MESSAGES.GENERIC_ERROR);
                return;
            }
            props.onSuccess(result.data.data);
        },
        onError: (res: unknown) => {
            const result = ApiErrorResponseSchema.safeParse(res);
            if (!result.success) {
                console.error(MESSAGES.API_VALIDATION_ERROR, result.error);
                props.onError(MESSAGES.GENERIC_ERROR);
                return;
            }
            props.onError(result.data.message);
        },
    });
}