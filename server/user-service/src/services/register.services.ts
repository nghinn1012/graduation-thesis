import UserModel from '../db/models/User.models';
import { validateEmail, validatePassword, InvalidDataError } from '../data/index.data';
import { hashText } from '../utlis/bcrypt';
import { signToken } from '../utlis/jwt';  // Function to sign JWT token
import { BrokerSource, RabbitMQ, brokerOperations } from "../broker/index";
import { USER_SERVICE } from '../config/users.config';
import { v2 as cloudinary } from "cloudinary";

export interface ManualAccountRegisterInfo {
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
      refreshToken: "",
    });

    const token = signToken({
      ...info,
      password: hashText(info.password)
    }, "1h");

    RabbitMQ.instance.publicMessage(
      BrokerSource.NOTIFICATION,
      brokerOperations.mail.ACTIVE_MANUAL_ACCOUNT,
      {
        email: info.email,
        token: token,
      }
    );

    return newUser;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message
    });
  }
};
