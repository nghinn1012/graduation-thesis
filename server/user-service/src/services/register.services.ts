import UserModel from '../db/models/User.models';
import { validateEmail, validatePassword, InvalidDataError } from '../data/index.data';
import { hashText } from '../utlis/bcrypt';
import { signToken } from '../utlis/jwt';
import { BrokerSource, RabbitMQ, brokerOperations } from "../broker/index";

export interface ManualAccountRegisterInfo {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export const generateUniqueUsername = async (name: string): Promise<string> => {
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 15);

  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingUser = await UserModel.findOne({ username });
    if (!existingUser) {
      return username;
    }
    username = `${baseUsername}${counter}`;
    counter++;
  }
};

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
    const username = await generateUniqueUsername(name);

    const newUser = await UserModel.create({
      name,
      email,
      username, // Add generated username
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

export const resendEmailVerify = async (email: string) => {
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new InvalidDataError({
        message: "not-exist"
      });
    }

    if (user.verify === 1) {
      throw new InvalidDataError({
        message: "user-verified"
      });
    }

    const token = signToken(
      { email: user.email },
      "1h" // Thời hạn 1 giờ
    );

    RabbitMQ.instance.publicMessage(
      BrokerSource.NOTIFICATION,
      brokerOperations.mail.ACTIVE_MANUAL_ACCOUNT,
      {
        email: user.email,
        token: token,
      }
    );

    return {
      message: "Verification email resent successfully",
    };
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message,
    });
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new InvalidDataError({
        message: "Email not found",
      });
    }

    const resetToken = signToken({ email, userId: user?._id }, "1h");

    RabbitMQ.instance.publicMessage(
      BrokerSource.NOTIFICATION,
      brokerOperations.mail.FORGOT_PASSWORD,
      {
        email,
        token: resetToken,
      }
    );

    return { message: "Reset link sent successfully to email" };
  } catch (error) {
    console.error("Error in forgotPassword service:", error);
    throw new InvalidDataError({
      message: (error as Error).message,
    });
  }
};

export const updatePassword = async (userId: string, password: string, confirmPassword: string) => {
  try {
    console.log(userId, password, confirmPassword);
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new InvalidDataError({
        message: "User not found",
      });
    }

    if (password !== confirmPassword) {
      throw new InvalidDataError({
        message: "Password does not match",
      });
    }

    // Use the existing hashText function
    const hashedPassword = hashText(password);
    if (!hashedPassword) {
      throw new InvalidDataError({
        message: "Error hashing password",
      });
    }

    // Update with hashed password
    await UserModel.updateOne({ _id: userId }, { password: hashedPassword });

    return { message: "Password updated successfully" };
  } catch (error) {
    console.error("Error in updatePassword service:", error);
    throw new InvalidDataError({
      message: (error as Error).message,
    });
  }
};
