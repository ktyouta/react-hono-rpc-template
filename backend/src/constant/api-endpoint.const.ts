/**
 * APIエンドポイント定数
 */
export const API_ENDPOINT = {
  HEALTH: "/api/v1/health",
  SAMPLE: "/api/v1/sample",
  FRONT_USER: "/api/v1/frontuser",
  FRONT_USER_ID: "/api/v1/frontuser/:userId",
  FRONT_USER_LOGIN: "/api/v1/frontuser-login",
  REFRESH: "/api/v1/refresh",
  VERIFY: "/api/v1/verify",
  LOGOUT: "/api/v1/frontuser-logout",
  FRONT_USER_PASSWORD: "/api/v1/frontuser-password/:userId",
} as const;

export type ApiEndpointType = (typeof API_ENDPOINT)[keyof typeof API_ENDPOINT];
