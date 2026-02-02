import { paths } from '@/config/paths';
import { Navigate } from 'react-router-dom';
import { useLogin } from '../hooks/use-login';
import { Login } from './login';

export function LoginContainer() {

    const props = useLogin();

    // ログイン済み
    if (props.loginUser) {
        return (
            <Navigate
                to={paths.home.path}
                replace
            />
        );
    }

    return (
        <Login
            {...props}
        />
    );
}