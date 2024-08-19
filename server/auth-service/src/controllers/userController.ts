import { Request, Response } from "express";
import {
  TAccountRegisterMethod,
  validateEmail,
  validatePassword,
  validateAccountRegisterMethod
} from "../data";

interface IRequestAccountParams { }

interface IResponseAccountBody { }

interface IRequestAccountBody {
  email?: string;
  password?: string;
}

interface IRequestAccountQuery {
  method?: TAccountRegisterMethod;
}

export const registerAccount = (request: Request<IRequestAccountParams, IResponseAccountBody, IRequestAccountBody, IRequestAccountQuery>, response: Response) => {
  const method: TAccountRegisterMethod | undefined = request.query.method;
  validateAccountRegisterMethod(method);
  switch (method) {
    case "mannual":
      const { email, password } = request.body;
      validateEmail(email);
      validatePassword(password);
    case "google-oauth":

    case "facebook-oauth":

  }
  return response.send("Loading");
}
