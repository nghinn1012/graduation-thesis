// ProtectedAdminRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { account, auth } = useAuthContext();
  const location = useLocation();

  if (!account || !auth?.token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (account.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
export default ProtectedAdminRoute;
