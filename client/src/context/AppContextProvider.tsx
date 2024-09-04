import React from "react";
import AuthContextProvider from "./AuthContext";
import I18nContextProvider from "./I18nContext";

interface IAppContextProvidersProps {
  children?: React.ReactNode;
}

export default function AppContextProviders({ children }: IAppContextProvidersProps) {
  return (
    <I18nContextProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </I18nContextProvider>
  );
}
