import UserModel from "../db/models/User.models";

export const rpcGetUserById = async (
  _id: string,
  select?: string | string[]
) => {
  const query = UserModel.findById(_id);
  if (select) {
    query.select(select);
  }
  return query.exec();
};
