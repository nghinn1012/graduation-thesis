import React from "react";
import AuthContextProvider from "./AuthContext";
import I18nContextProvider from "./I18nContext";
import { PostProvider } from "./PostContext";
import { SocketProvider } from "./SocketContext";
import ToastContextProvider from "./ToastContext";
import { UserProvider } from "./UserContext";
interface IAppContextProvidersProps {
  children?: React.ReactNode;
}

export default function AppContextProviders({
  children,
}: IAppContextProvidersProps) {
  return (
    <ToastContextProvider>
      <I18nContextProvider>
        <AuthContextProvider>
          <PostProvider>
            <UserProvider>
              <SocketProvider>{children}</SocketProvider>
            </UserProvider>
          </PostProvider>
        </AuthContextProvider>
      </I18nContextProvider>
    </ToastContextProvider>
  );
}
