import React from "react";
import AuthContextProvider from "./AuthContext";
import { PostProvider } from "./PostContext";

interface IAppContextProvidersProps {
  children?: React.ReactNode;
}

export default function AppContextProviders({
  children,
}: IAppContextProvidersProps) {
  return (
      <AuthContextProvider>
          <PostProvider>{children}</PostProvider>
      </AuthContextProvider>
  );
}
