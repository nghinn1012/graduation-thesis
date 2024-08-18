import { Request, Response } from "express";
import { registerUser } from "../services/userService";

export interface IRegisterAccountBody {
  email: string;
  password: string;
  name: string;
}

export const register = async (req: Request, res: Response) => {
  console.log(req.body);

  const { email, password, name } = req.body;
  const userInfo: IRegisterAccountBody = { email, password, name };

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Invalid request: Missing values" });
  }

  try {
    const newUser = await registerUser(userInfo);
    return res.status(201).json(newUser);
  } catch (err: any) {
    if (err.message === "User already exists") {
      return res.status(409).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
