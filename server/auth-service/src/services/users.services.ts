import UserModel from '../db/models/schemas/User.schema';
import { validateEmail } from '../data/validation.data';
import { validatePassword } from '../data/validation.data';
import { InvalidDataError } from '../data/invalid_data.data';
import { compareHash, hashText } from '../utlis/bcrypt';
import { signToken } from '../utlis/jwt';
import axios from 'axios';
import { GOOGLE_AUTHORIZED_REDIRECT_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/users.config';

interface LoginInfo {
  email: string;
  password: string;
}

interface ManualAccountRegisterInfo {
  email: string;
  password: string;
  name: string;
}

interface GoogleUser {
  email: string;
  name: string;
  verified_email: boolean;
  picture?: string;
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

export const getOauthGoogleToken = async (code: string) => {
  const body = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_AUTHORIZED_REDIRECT_URI,
    grant_type: 'authorization_code',
  };

  const { data } = await axios.post(
    'https://oauth2.googleapis.com/token',
    body,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return data;
};

export const registerServiceByGoogle = async (id_token: string, access_token: string) => {
  try {
    const { data: googleUser } = await axios.get<GoogleUser>(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        params: {
          access_token,
          alt: 'json',
        },
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    console.log(googleUser);

    if (!googleUser.verified_email) {
      throw new InvalidDataError({ message: 'Google email not verified' });
    }

    const existingUser = await UserModel.findOne({ email: googleUser.email });
    if (existingUser) {
      const token = signToken({ userId: existingUser._id });
      return { ...existingUser.toObject(), token };
    }

    const newUser = await UserModel.create({
      name: googleUser.name,
      email: googleUser.email,
      password: null, // No password since this is a Google account
      profilePicture: googleUser.picture,
    });

    const token = signToken({ userId: newUser._id });

    return { ...newUser.toObject(), token };
  } catch (error) {
    throw new InvalidDataError({ message: (error as Error).message });
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
