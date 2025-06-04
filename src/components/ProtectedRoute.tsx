import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('employer' | 'jobseeker')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const currentUser = useStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 