import { FrontUserEntity } from "../entity";

/**
 * ユーザー作成レスポンスの型
 */
export type CreateFrontUserResponseType = {
  accessToken: string;
  user: {
    id: number;
    name: string;
    birthday: string;
  };
};

/**
 * ユーザー作成レスポンスDTO
 */
export class CreateFrontUserResponseDto {
  private readonly _value: CreateFrontUserResponseType;

  constructor(entity: FrontUserEntity, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        id: entity.frontUserId,
        name: entity.frontUserName,
        birthday: entity.frontUserBirthday,
      },
    };
  }

  get value(): CreateFrontUserResponseType {
    return this._value;
  }
}
