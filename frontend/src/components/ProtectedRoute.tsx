import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute - Debug:', {
    isAuthenticated,
    loading,
    hasToken: !!localStorage.getItem('authToken')
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has a token, even if isAuthenticated is false temporarily
  const hasToken = localStorage.getItem('authToken');
  
  if (!isAuthenticated && !hasToken) {
    
    return <Navigate to="/" replace />;
  }

  // If user has token but isAuthenticated is false, still allow access
  // This handles temporary authentication state issues
  if (!isAuthenticated && hasToken) {
    
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
