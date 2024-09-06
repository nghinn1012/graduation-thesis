import { Express, NextFunction, Request, Response } from "express";
import proxy from "express-http-proxy";
import endpoints from "../endpoints.json";
import { verifyToken } from "./jwt";

declare global {
  namespace Express {
    interface Request {
      authContent: any;
    }
  }
}

interface EndPoint {
  path: string;
  host: string;
  port: number;
  domain: string;
  token: {
    exclude: string[];
  };
}

const toExcludeList = (endpoints: EndPoint[]): Set<string> => {
  let result = new Set<string>();
  endpoints.forEach((endpoint: EndPoint) => {
    const preUrl = endpoint.path;
    endpoint.token.exclude.forEach((api: string) => {
      result.add(preUrl + api);
    });
  });
  return result;
};

export const withProxy = (app: Express): void => {
  const excludeList = toExcludeList(endpoints);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const pathName = req.path;
    if (!pathName.startsWith("/api")) {
      return next();
    }
    if (!excludeList.has(pathName)) {
      const verified = verifyToken(req.headers.authorization?.split(" ")[1]);
      if (verified == null || typeof verified === "string") {
        return res.status(400).json({
          err: {
            message: "Invalid token",
            data: {
              target: "token",
              reason: "invalid-token",
            },
          },
        });
      }
      console.log(req.originalUrl, req.url, req.baseUrl);
    }
    return next();
  });

  endpoints.forEach((endpoint: EndPoint) => {
    const url = `${endpoint.host}:${endpoint.port}/${endpoint.domain}`;

    app.use(endpoint.path, proxy(url));

    console.log(
      "[PROXY] [BINDING] ",
      `"${endpoint.path}"`,
      " to ",
      `"${url}"`
    );
  });
};
