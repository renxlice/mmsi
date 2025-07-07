import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type Role = 'ADMIN' | 'STRATEGIST' | 'NOMINEE';

interface RoleRouteProps {
  role: Role;
  children: ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ role, children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const isAuthenticated = !!token && typeof token === 'string' && token.length > 10;
  const isAuthorized = userRole === role;

  // ✅ Cek autentikasi
  if (!isAuthenticated) {
    console.warn('[RoleRoute] Not authenticated. Redirecting to login.');
    return <Navigate to="/" replace />;
  }

  // ✅ Cek otorisasi role
  if (!isAuthorized) {
    console.warn(`[RoleRoute] Unauthorized role. Required: ${role}, Found: ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
