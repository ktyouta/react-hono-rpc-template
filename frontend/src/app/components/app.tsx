import { Errors, Loading } from '@/components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoginUserProvider } from './login-user-provider';
import { AppRouter } from './router';

export function App() {

  //React-Query用
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <ErrorBoundary
        FallbackComponent={Errors}
      >
        <Suspense
          fallback={<Loading />}
        >
          <QueryClientProvider
            client={queryClient}
          >
            <ToastContainer
              position="top-center"
              autoClose={3000}
            />
            <LoginUserProvider>
              <AppRouter />
            </LoginUserProvider>
            {/* React-query devtool */}
            <ReactQueryDevtools
              initialIsOpen={false}
            />
          </QueryClientProvider>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}