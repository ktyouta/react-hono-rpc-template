import { paths } from '@/config/paths';
import { LoginContainer } from '@/features/login/components/login-container';
import { SignupContainer } from '@/features/signup/components/signup-container';
import { UpdatePasswordContainer } from '@/features/updatepassword/components/update-password-container';
import { UpdateUserContainer } from '@/features/updateuser/components/update-user-container';
import { lazy, ReactNode } from 'react';
import { useRoutes } from 'react-router-dom';
import { GuestRoute } from './guest-route';
import { ProtectedRoute } from './protected-route';

// lazy import（コード分割）
const HomeContainer = lazy(() => import('@/features/home/components/home/home-container').then(m => ({ default: m.HomeContainer })));
const SampleContainer = lazy(() => import('@/features/sample/components/sample/sample-container').then(m => ({ default: m.SampleContainer })));
const MyPage = lazy(() => import('@/features/mypage/components/mypage/mypage').then(m => ({ default: m.MyPage })));
const NotFound = lazy(() => import('@/components/pages/notfound/not-found').then(m => ({ default: m.NotFound })));


const routerList: { path: string, element: ReactNode }[] = [
    {
        path: paths.home.path,
        element: (
            <HomeContainer />
        )
    },
    {
        path: paths.sample.path,
        element: (
            <SampleContainer />
        )
    },
    {
        path: paths.mypage.path,
        element: (
            <ProtectedRoute>
                <MyPage />
            </ProtectedRoute>
        )
    },
    {
        path: paths.login.path,
        element: (
            <GuestRoute>
                <LoginContainer />
            </GuestRoute>
        )
    },
    {
        path: paths.signup.path,
        element: (
            <GuestRoute>
                <SignupContainer />
            </GuestRoute>
        )
    },
    {
        path: paths.updateUser.path,
        element: (
            <ProtectedRoute>
                <UpdateUserContainer />
            </ProtectedRoute>
        )
    },
    {
        path: paths.updatePassword.path,
        element: (
            <ProtectedRoute>
                <UpdatePasswordContainer />
            </ProtectedRoute>
        )
    },
    {
        path: `*`,
        element: <NotFound />
    }
];

export const AppRouter = () => {
    const router = useRoutes(routerList);
    return router;
};
