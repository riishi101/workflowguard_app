import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  hubspotPortalId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  connectHubSpot: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  testAuthentication?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return; // Prevent multiple initializations

    const initializeAuth = async () => {
      try {
        // Check for token in URL after OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const successParam = urlParams.get('success');
        const tokenParam = urlParams.get('token');

        if (successParam === 'true' && tokenParam) {
          localStorage.setItem('authToken', tokenParam);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await ApiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            // If we just got the token from OAuth and we're authenticated,
            // redirect to workflow selection
            if (successParam === 'true' && tokenParam) {
              window.location.href = '/workflow-selection';
              return;
            }
          } else {
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext - Auth initialization error:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = () => {
    window.location.href = '/api/auth/hubspot';
  };

  const testAuthentication = async () => {
    return;
  };

  const logout = async () => {
    console.log('AuthContext - Logout called (OAuth DISABLED)');
    setUser(null);
    localStorage.removeItem('authToken');
    console.log('AuthContext - Mock logout completed');
  };

  const value: AuthContextType = {
    user,
    loading,
    connectHubSpot,
    logout,
    isAuthenticated: !!user,
    testAuthentication, // Add this for debugging
  };

  console.log('AuthContext - Current state (OAuth DISABLED):', { user: !!user, loading, isAuthenticated: !!user, hasInitialized });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};