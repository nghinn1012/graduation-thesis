import { Request, Response } from "express";


export const hello = (_request: Request, response: Response): Response => {
  console.log("Hello");
  return response.send("Hello from Post Service");
}
