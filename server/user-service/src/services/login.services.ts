import UserModel, { UserVerifyStatus } from "../db/models/User.models";
import { InvalidDataError } from "../data/index.data";
import { compareHash, hashText } from "../utlis/bcrypt";
import { signRefreshToken, signToken, verifyToken } from "../utlis/jwt";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, JWT_PRIVATE_KEY } from "../config/users.config";
import jwt from "jsonwebtoken";
import { generateUniqueUsername } from "./register.services";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface LoginInfo {
  email: string;
  password: string;
  role?: string;
}

interface GooglePayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat: number;
  exp: number;
}

// export const loginService = async (info: LoginInfo) => {
//   const { email, password } = info;
//   console.log(email, password);

//   const user = await UserModel.findOne({ email: email });
//   console.log(user);
//   if (user === null) {
//     throw new InvalidDataError({
//       message: "Invalid email or password",
//     });
//   }

//   const isPasswordValid = await compareHash(password, user.password || "");
//   if (!isPasswordValid) {
//     throw new InvalidDataError({
//       message: "Invalid email or password",
//     });
//   }

//   if (user.verify == 0) {
//     throw new InvalidDataError({
//       message: "User is not verify!",
//     });
//   }

//   const token = signToken({ userId: user._id, email: user.email });
//   const refreshToken = signRefreshToken({
//     userId: user._id,
//     email: user.email,
//   });

//   user.refreshToken = refreshToken;
//   await user.save();
//   const { password: userPassword, ...userWithoutPassword } = user.toJSON();
//   return {
//     ...userWithoutPassword,
//     token,
//     refreshToken,
//   };
// };

export const loginService = async (info: LoginInfo) => {
  const { email, password, role = "user" } = info;
  console.log(email, password, role);

  const user = await UserModel.findOne({
    email: email,
    role: role
  });

  console.log(user);

  if (user === null) {
    throw new InvalidDataError({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await compareHash(password, user.password || "");
  if (!isPasswordValid) {
    throw new InvalidDataError({
      message: "Invalid email or password",
    });
  }

  if (user.verify == 0) {
    throw new InvalidDataError({
      message: "User is not verified!",
    });
  }

  const token = signToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  const refreshToken = signRefreshToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  user.refreshToken = refreshToken;
  await user.save();

  const { password: userPassword, ...userWithoutPassword } = user.toJSON();
  return {
    ...userWithoutPassword,
    token,
    refreshToken,
  };
};

export const googleLoginService = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GooglePayload;

    if (!payload || !payload.email_verified) {
      throw new InvalidDataError({ message: "Google authentication failed" });
    }

    const { email, name, sub: googleId, picture } = payload;

    if (!email || !name) {
      throw new InvalidDataError({
        message: "Missing email or name from Google account",
      });
    }

    let user = await UserModel.findOne({
      $or: [{ email }, { googleId }],
    });

    if (user) {
      const token = signToken({ userId: user?._id, email: user?.email });
      const refreshToken = signRefreshToken({
        userId: user?._id,
        email: user?.email,
      });
      user.googleId = googleId;
      user.googleEmail = email;
      user.refreshToken = refreshToken;
      user.avatar = picture || user.avatar;

      await user.save();
      return {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          verify: user.verify,
        },
        token,
      };
    } else {
      const username = await generateUniqueUsername(name);
      const newUser = new UserModel({
        name,
        email,
        googleId,
        username,
        googleEmail: email,
        avatar: picture,
        verify: UserVerifyStatus.Verified,
      });

      await newUser.save();
      const token = signToken({ userId: newUser?._id, email: newUser?.email });
      const refreshToken = signRefreshToken({
        userId: newUser?._id,
        email: newUser?.email,
      });

      newUser.refreshToken = refreshToken;
      await newUser.save();
      return {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          avatar: newUser.avatar,
          verify: newUser.verify,
        },
        token,
      };
    }
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || "Google login failed",
    });
  }
};
export const refreshTokenService = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_PRIVATE_KEY) as {
      data: { userId: string; email: string };
    };
    const user = await UserModel.findById(decoded?.data?.userId);

    if (!user) {
      throw new InvalidDataError({
        message: "User not found",
      });
    }

    const newToken = signToken({ userId: user._id, email: user.email });
    const newRefreshToken = signRefreshToken({
      userId: user._id,
      email: user.email,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return { user, token: newToken };
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || "Could not refresh token",
    });
  }
};
