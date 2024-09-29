export interface IUserPersonal {
  name: string;
  avatar?: string;
}

export interface IUserCredential {
  _id: string
  email: string;
  password: string;
  verify: number;
}

export interface IUser extends IUserPersonal, IUserCredential { }

export interface IAccountInfo
  extends Partial<Pick<IUserCredential, "_id" | "email">>,
  Partial<Pick<IUserPersonal, "avatar" | "name">> {
  token: string;
  user: unknown;
}
