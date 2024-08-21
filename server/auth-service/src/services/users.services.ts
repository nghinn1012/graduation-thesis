import bcrypt from 'bcrypt';
import UserModel from '../db/models/schemas/User.schema';
import { validateEmail } from '../data/validation.data';
import { validatePassword } from '../data/validation.data';
import { InvalidDataError } from '../data/invalid_data.data';
import { compareHash, hashText } from '../utlis/bcrypt';
import { signToken } from '../utlis/jwt';

interface LoginInfo {
  email: string;
  password: string;
}

interface ManualAccountRegisterInfo {
  email: string;
  password: string;
  name: string;
}

export const registerService = async (info: ManualAccountRegisterInfo) => {
  try {
    const { email, password, name } = info;
    const existingUser = await UserModel.findOne({ email: email })
    if (existingUser) {
      throw new InvalidDataError({
        message: "User already exist"
      });
    }
    await validateEmail(email);
    await validatePassword(password);

    const hashedPassword = await hashText(password);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword
    });

    return newUser;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message
    });
  }
};

export const loginService = async (info: LoginInfo) => {
  const { email, password } = info;

  const user = await UserModel.findOne({ email: email });
  if (user === null) {
    throw new InvalidDataError({
      message: "Invalid email or password"
    });
  }

  const isPasswordValid = await compareHash(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidDataError({
      message: "Invalid email or password"
    });
  }

  const token = signToken({ userId: user._id });

  return {
    ...user,
    token,
  };
};
