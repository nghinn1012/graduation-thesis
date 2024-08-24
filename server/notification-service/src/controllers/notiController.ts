import { Request, Response } from "express";
import { sendActiveMannualAccount } from "../services/mailService";


export const hello = (_request: Request, response: Response): Response => {
  console.log("Hello");
  sendActiveMannualAccount({
    token: "123455",
    email: "ngo.thao.huong@sun-asterisk.com"
  })
  return response.send("Hello from Notification Service");
}
