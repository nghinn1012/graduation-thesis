import React from "react";
import AuthContextProvider from "./AuthContext";

interface IAppContextProvidersProps {
  children?: React.ReactNode;
}

export default function AppContextProviders({ children }: IAppContextProvidersProps) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}
