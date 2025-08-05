import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
        // Real OAuth initialization logic here
        // Example: check for token in localStorage or URL, validate, fetch user profile, etc.
        const token = localStorage.getItem('authToken');
        if (token) {
          // Fetch user profile from backend using token
          const response = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext - Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = () => {
    // Real OAuth redirect logic
    window.location.href = process.env.REACT_APP_OAUTH_URL || '/api/auth/login';
  };

  const testAuthentication = async () => {
    console.log('AuthContext - Testing authentication manually (OAuth DISABLED)');
    console.log('AuthContext - Using mock authentication');
    
    // Return mock user
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@workflowguard.pro',
      name: 'Development User',
      role: 'user',
      hubspotPortalId: '123456789',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setUser(mockUser);
    console.log('AuthContext - Mock authentication successful');
  };

  const logout = async () => {
    console.log('AuthContext - Logout called (OAuth DISABLED)');
    setUser(null);
    localStorage.removeItem('token');
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