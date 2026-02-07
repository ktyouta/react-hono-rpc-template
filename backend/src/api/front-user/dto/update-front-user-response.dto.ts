/**
 * ユーザー更新レスポンスの型
 */
export type UpdateFrontUserResponseType = {
  user: {
    id: number;
    name: string;
    birthday: string;
  };
};

/**
 * ユーザー更新レスポンスDTO
 */
export class UpdateFrontUserResponseDto {
  private readonly _value: UpdateFrontUserResponseType;

  constructor(userId: number, userName: string, birthday: string) {
    this._value = {
      user: {
        id: userId,
        name: userName,
        birthday,
      },
    };
  }

  get value(): UpdateFrontUserResponseType {
    return this._value;
  }
}
