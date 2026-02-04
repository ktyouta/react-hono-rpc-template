import { apiPaths } from '@/config/api-paths';
import { env } from '@/config/env';
import { accessTokenRef, resetAccessToken, resetLogin, updateAccessToken } from '@/stores/access-token-store';
import { default as Axios, InternalAxiosRequestConfig } from 'axios';

type QueueItem = {
  resolve: (accessToken: string) => void;
  reject: (reason?: any) => void;
};

function authRequestInterceptor(config: InternalAxiosRequestConfig) {

  config.headers = config.headers || {};
  config.headers.Accept = 'application/json';

  if (accessTokenRef) {
    config.headers['Authorization'] = `Bearer ${accessTokenRef}`;
  }

  config.withCredentials = true;

  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL
});

const refreshApi = Axios.create({
  baseURL: env.API_URL
});

api.interceptors.request.use(authRequestInterceptor);
refreshApi.interceptors.request.use(authRequestInterceptor);

let isRefreshing = false;
let queue: QueueItem[] = [];

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true;

      return new Promise(async (resolve, reject) => {

        queue.push({
          resolve: (token) => {

            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: token,
            };

            resolve(api(originalRequest));
          },
          reject,
        });

        if (!isRefreshing) {

          isRefreshing = true;

          try {

            // リフレッシュ
            const res = await refreshApi.post(
              apiPaths.refresh,
              {},
            );

            const newAccessToken = res.data.data;
            updateAccessToken(newAccessToken);

            // 認証エラーになったAPIを再度コール
            const currentQueue = [...queue];
            queue = [];

            currentQueue.forEach(cb => {
              cb.resolve(newAccessToken);
            });
          } catch (err) {

            // リフレッシュ失敗
            resetAccessToken();
            resetLogin();

            const currentQueue = [...queue];
            queue = [];

            currentQueue.forEach(cb => {
              cb.reject(err);
            });
          } finally {
            isRefreshing = false;
          }
        }
      });
    }

    return Promise.reject(error);
  },
);