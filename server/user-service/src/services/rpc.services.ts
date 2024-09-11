import UserModel from "../db/models/User.models";
import User from "../db/models/User.models";

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

export const rpcGetUserByIds = async (
  _ids: string[],
  select?: string | string[]
) => {
  try {
    const query = UserModel.find({ _id: { $in: _ids } });

    if (select) {
      query.select(select);
    }

    const users = await query.exec();

    const sortedUsers = _ids.map(id => users.find(user => user._id.toString() === id));

    return sortedUsers;
  } catch (error) {
    console.error('Error finding users by IDs:', error);
    throw error;
  }
};
