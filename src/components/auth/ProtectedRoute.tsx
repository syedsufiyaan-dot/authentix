import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-darkest flex flex-col items-center justify-center text-accent-teal">
        <div className="w-12 h-12 border-2 border-accent-teal/20 border-t-accent-teal rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
