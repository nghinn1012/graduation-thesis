import { Request, Response, NextFunction } from "express";
import { InternalError } from "../data/index.data";

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
        return response.status(500).json({
            error: {
                message: "Internal server error",
                code: 500,
                data: {
                    target: "unknown",
                    reason: "unknown"
                }
            }
        });
    }
}
