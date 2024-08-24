import UserModel from '../db/models/User.models';
import { validateEmail, validatePassword, InvalidDataError } from '../data/index.data';
import { hashText } from '../utlis/bcrypt';
import { signToken } from '../utlis/jwt';  // Function to sign JWT token
import { operations, brokerChannel } from "../broker/index";
import { USER_SERVICE } from '../config/users.config';

interface ManualAccountRegisterInfo {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export const registerService = async (info: ManualAccountRegisterInfo) => {
  try {
    const { email, password, name, confirmPassword } = info;
    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      throw new InvalidDataError({
        message: "User already exists"
      });
    }

    await validateEmail(email);
    await validatePassword(password);

    if (password !== confirmPassword) {
      throw new InvalidDataError({
        message: "Password does not match"
      });
    }

    const hashedPassword = await hashText(password);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verify: 0,
    });

    const token = signToken({
      ...info,
      password: hashText(info.password)
    }, "1h");

    const message = JSON.stringify({
        email: info.email,
        operation: operations.mail.ACTIVE_MANNUAL_ACCOUNT,
        token: token,
        from: USER_SERVICE
    });

  // Send verification email
  await brokerChannel.toMessageServiceQueue(message);

    return newUser;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message
    });
  }
};
