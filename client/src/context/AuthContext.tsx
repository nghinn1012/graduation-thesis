import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoginInfo, userFetcher } from "../api/user";
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
        const account = result.data as unknown as IAccountInfo;
        setAccount(account.user as unknown as IAccountInfo);
        setToken(account?.token);
        localStorage.setItem("account", JSON.stringify(account));
        localStorage.setItem("auth", JSON.stringify(auth));
      })
      .catch((error) => {
        console.error(error);
      });
  }, [auth, setToken]);

  useEffect(() => {
    const timeOut = timeOutRef.current;
    if (timeOut != undefined) {
      clearTimeout(timeOut);
    }
    if (auth && account) {
      const delta = Date.now() - auth.updatedAt;
      if (delta >= 40 * 60 * 1000 && delta <= 59 * 60 * 1000) {
        refreshToken();
        timeOutRef.current = setTimeout(() => {
          refreshToken();
        }, 40 * 60 * 1000 - auth.updatedAt);
      } else if (delta > 59 * 60 * 1000) {
        logout();
      }
    }
  }, [account, auth, refreshToken]);

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
