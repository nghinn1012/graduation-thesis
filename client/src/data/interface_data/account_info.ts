export interface IUserPersonal {
  name: string;
  avatar?: string;
}

export interface IUserCredential {
  email: string;
  password: string;
  verify: number;
}

export interface IUser extends IUserPersonal, IUserCredential {}

export interface IAccountInfo
  extends Partial<Pick<IUserCredential, "email">>,
    Partial<Pick<IUserPersonal, "avatar" | "name">> {
  token: string;
}
