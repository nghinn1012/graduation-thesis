import { Request, Response, NextFunction } from "express";
import { InternalError } from "../data";

export const errorHandler = (error: Error, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof InternalError) {
    return response.status(error.code).json({
      error: {
        message: error.message,
        code: error.code,
        data: error.data
      }
    });
  } else {
    console.error(error);
    return response.status(500).json({ message: "An unkown error occured" });
  }
}
