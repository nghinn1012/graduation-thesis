import React from "react";
import AuthContextProvider from "./AuthContext";
import I18nContextProvider from "./I18nContext";
import { PostProvider } from "./PostContext";
import IsAuthenticated from "../common/auth/IsAuthenticated";
// import SocketContextProvider from "./SocketContext";

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
          {/* <SocketContextProvider> */}
            {children}
          {/* </SocketContextProvider> */}
          </PostProvider>
      </AuthContextProvider>
    </I18nContextProvider>
  );
}
