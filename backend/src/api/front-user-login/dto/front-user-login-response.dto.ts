import type { FrontUserMaster } from "../../../infrastructure/db";

/**
 * ログインレスポンスの型
 */
export type FrontUserLoginResponseType = {
  accessToken: string;
  user: {
    id: number;
    name: string;
    birthday: string;
  };
};

/**
 * ログインレスポンスDTO
 */
export class FrontUserLoginResponseDto {
  private readonly _value: FrontUserLoginResponseType;

  constructor(userInfo: FrontUserMaster, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        birthday: userInfo.birthday,
      },
    };
  }

  get value(): FrontUserLoginResponseType {
    return this._value;
  }
}
