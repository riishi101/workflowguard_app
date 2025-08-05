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
        console.log('AuthContext - Starting initialization (OAuth DISABLED)');
        
        // OAuth is disabled - skip all OAuth processing
        console.log('AuthContext - OAuth flow disabled, skipping authentication');
        
        // Set a mock user for development purposes
        const mockUser = {
          id: 'dev-user-123',
          email: 'dev@workflowguard.pro',
          name: 'Development User',
          role: 'user',
          hubspotPortalId: '123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('AuthContext - Setting mock user for development');
        setUser(mockUser);
        
      } catch (error) {
        console.error('AuthContext - Auth initialization error:', error);
      } finally {
        console.log('AuthContext - Initialization complete, setting loading to false');
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = () => {
    console.log('AuthContext - OAuth DISABLED - connectHubSpot called');
    alert('OAuth authentication is temporarily disabled for development. Please use the local development environment.');
    
    // Don't redirect - OAuth is disabled
    console.log('AuthContext - OAuth redirect prevented');
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