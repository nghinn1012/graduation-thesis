import React from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Navigate } from "react-router";

interface AuthenticatedOptions {
  errorElement?: JSX.Element;
  redirectUrl?: string;
  withCallback?: boolean;
}

interface IAuthenticatedProps {
  children: React.ReactNode;
  options?: AuthenticatedOptions;
}

export default function IsAuthenticated({
  children,
  options,
}: IAuthenticatedProps): JSX.Element {
  const authentiationContext = useAuthContext();
  const { errorElement, redirectUrl, withCallback } = options ?? {};
  if (authentiationContext.auth == null) {
    if (redirectUrl === undefined && errorElement !== undefined) {
      return errorElement;
    }
    let url = redirectUrl ?? "/login";
    return <Navigate to={url} replace />;
  }
  return <>{children}</>;
}
