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
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return; // Prevent multiple initializations

    const initializeAuth = async () => {
      try {
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
        } else if (urlParams.get('success') === 'true' && urlParams.get('token')) {
          // OAuth was successful, store the token
          const token = urlParams.get('token');
          if (token) {
            localStorage.setItem('authToken', token);
            try {
              const response = await ApiService.getCurrentUser();
              setUser(response.data);
            } catch (error) {
              console.log('Failed to get user after OAuth');
            }
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
      } catch (error) {
        console.log('Auth initialization error:', error);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = () => {
    // Redirect to HubSpot OAuth URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const hubspotAuthUrl = `${baseUrl}/hubspot/auth/url`;
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