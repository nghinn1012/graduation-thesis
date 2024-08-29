import { Request, Response } from "express";


export const hello = (_request: Request, response: Response): Response => {
  return response.send("Hello from Post Service");
}
