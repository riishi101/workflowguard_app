import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  connectHubSpot: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
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

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if this is an OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        // This is a HubSpot OAuth callback
        try {
          // The backend will handle the OAuth callback
          // We just need to check if user is now authenticated
          const response = await ApiService.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.log('OAuth callback failed');
        }
      } else {
        // Check if user is already authenticated
        try {
          const response = await ApiService.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          // User not authenticated, that's okay for HubSpot app
          console.log('User not authenticated - HubSpot OAuth required');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const connectHubSpot = () => {
    // Redirect to HubSpot OAuth URL - use the API base URL without adding /api
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    // Remove /api from the end if it exists
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    const hubspotAuthUrl = `${cleanBaseUrl}/api/auth/hubspot/url`;
    window.location.href = hubspotAuthUrl;
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    connectHubSpot,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 