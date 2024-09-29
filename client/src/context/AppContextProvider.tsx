import React from "react";
import AuthContextProvider from "./AuthContext";
import I18nContextProvider from "./I18nContext";
import { PostProvider } from "./PostContext";
import { SocketProvider } from "./SocketContext";
import ToastContextProvider from "./ToastContext";
import { UserProvider } from "./UserContext";
import { SearchProvider } from "./SearchContext";
import { FollowProvider } from "./FollowContext";
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
          <SearchProvider>
            <UserProvider>
              <PostProvider>
                <FollowProvider>
                  <SocketProvider>{children}</SocketProvider>
                </FollowProvider>
              </PostProvider>
            </UserProvider>
          </SearchProvider>
        </AuthContextProvider>
      </I18nContextProvider>
    </ToastContextProvider>
  );
}
