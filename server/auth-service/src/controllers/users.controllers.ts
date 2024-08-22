import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import { loginService, registerService, getOauthGoogleToken, registerServiceByGoogle} from "../services/users.services";

export const registerController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await registerService({ name, email, password });

    return res.status(201).json({
      message: "Register success",
      user: newUser
    });
  } catch (error) {
    return res.status(400).json({
      message: "Register failed",
      error: (error as Error).message
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const token = await loginService({ email, password });

    return res.status(201).json({
      message: "Login success",
      token: token.token
    });
  } catch (error) {
    return res.status(400).json({
      message: "Login failed",
      error: (error as Error).message
    });
  }
}

export const googleOAuthController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    const data = await getOauthGoogleToken(code as string);
    const { id_token, access_token } = data;

    const userWithToken = await registerServiceByGoogle(id_token, access_token);

    return res.redirect(`http://localhost:3000/login/oauth?access_token=${userWithToken.token}`);
  } catch (error) {
    next(error);
  }
};
