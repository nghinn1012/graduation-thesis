import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { userFetcher } from "../api/user";
import { IAccountInfo } from "../data/interface_data/account_info";

interface IAuthContextProviderProps {
  children: React.ReactNode;
}

interface IAuthContext {
  account?: IAccountInfo;
  auth?: IAuthInfo;
  token?: string;
  setAccount: Dispatch<SetStateAction<IAccountInfo | undefined>>;
  setToken(token?: string, time?: number): void;
  logout(): void;
}

export interface IAuthInfo {
  token: string;
  updatedAt: number;
}

const loadFromLocal = (): {
  auth: IAuthInfo;
  account: IAccountInfo;
} | null => {
  try {
    const authValue = localStorage.getItem("auth");
    const accountValue = localStorage.getItem("account");
    if (!authValue || !accountValue) return null;
    const auth = JSON.parse(authValue) as IAuthInfo | undefined;
    const account = JSON.parse(accountValue) as IAccountInfo | undefined;
    if (!auth || !account) {
      return null;
    }
    return {
      auth,
      account,
    };
  } catch (error) {
    // DO NOTHING
  }
  return null;
};

export const AuthenticationContext = createContext<IAuthContext>({
  setAccount: () => {},
  logout: () => {},
  setToken: () => {},
});

export default function AuthContextProvider({
  children,
}: IAuthContextProviderProps) {
  const local = loadFromLocal();
  const [account, setAccount] = useState<IAccountInfo | undefined>(
    local?.account
  );
  const [auth, setAuth] = useState<IAuthInfo | undefined>(local?.auth);
  const timeOutRef = useRef<NodeJS.Timeout | undefined>();

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("account");
    sessionStorage.clear();
    setAccount(undefined);
    setAuth(undefined);
  };

  const setToken = useCallback((token?: string, updatedAt?: number): void => {
    updatedAt ??= Date.now();
    if (token == null) {
      setAuth(undefined);
    } else {
      setAuth({
        token,
        updatedAt,
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
    localStorage.setItem("account", JSON.stringify(account));
  }, [account, auth]);

  const refreshToken = useCallback(() => {
    if (auth?.token == null) {
      logout();
      return;
    }
    userFetcher
      .refreshToken(auth.token)
      .then((result) => {
        setAccount(result.user as unknown as IAccountInfo);
        setToken(result?.token as unknown as string);
        localStorage.setItem("account", JSON.stringify(result.user));
        localStorage.setItem("auth", JSON.stringify(result?.token));
      })
      .catch((error) => {
        console.error(error);
      });
  }, [auth, setToken]);

  useEffect(() => {
    const timeOut = timeOutRef.current;
    if (timeOut) {
      clearTimeout(timeOut);
    }

    if (auth && account) {
      const delta = Date.now() - auth.updatedAt;
      const refreshTime = 45 * 60 * 1000;
      const expiryTime = 59 * 60 * 1000;

      if (delta >= refreshTime && delta <= expiryTime) {
        refreshToken();
        console.log("Token refreshed");

        timeOutRef.current = setTimeout(() => {
          refreshToken();
          console.log("Token refreshed again");
        }, refreshTime);
      } else if (delta > expiryTime) {
        console.log("Token expired");
        logout();
      } else {
        timeOutRef.current = setTimeout(() => {
          refreshToken();
          console.log("Token refreshed from initial setup");
        }, refreshTime - delta);
      }
    }

    return () => {
      const timeOut = timeOutRef.current;
      if (timeOut) {
        clearTimeout(timeOut);
      }
    };
  });

  return (
    <AuthenticationContext.Provider
      value={{
        account,
        setAccount,
        logout,
        setToken,
        auth,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}
