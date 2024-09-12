import React from "react";
import AuthContextProvider from "./AuthContext";
import I18nContextProvider from "./I18nContext";
import { PostProvider } from "./PostContext";
import {SocketProvider} from "./SocketContext";

interface IAppContextProvidersProps {
  children?: React.ReactNode;
}

export default function AppContextProviders({
  children,
}: IAppContextProvidersProps) {
  return (
    <I18nContextProvider>
      <AuthContextProvider>
          <PostProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
          </PostProvider>
      </AuthContextProvider>
    </I18nContextProvider>
  );
}
