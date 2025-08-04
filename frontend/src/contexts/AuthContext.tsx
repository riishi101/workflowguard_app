import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService, User } from '@/lib/api';

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
        console.log('AuthContext - Starting initialization');
        
        // Check if this is an OAuth success callback
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const token = urlParams.get('token');
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        console.log('AuthContext - URL params:', { success, token: !!token, code: !!code, state: !!state });

        if (success === 'true' && token) {
          // OAuth was successful, store the token and get user
          console.log('AuthContext - OAuth success detected, storing token');
          console.log('AuthContext - Token received (first 50 chars):', token.substring(0, 50) + '...');
          localStorage.setItem('token', token);
          
          try {
            console.log('AuthContext - Fetching user after OAuth success');
            const response = await ApiService.getCurrentUser();
            console.log('AuthContext - User fetched successfully:', response);
            // The backend returns user directly, not wrapped in ApiResponse
            setUser(response);
          } catch (error) {
            console.error('AuthContext - Failed to get user after OAuth:', error);
            console.error('AuthContext - Error details:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            // Don't clear the token, let the user try again
          }
        } else if (code && state) {
          // This is a HubSpot OAuth callback (not used in current flow)
          console.log('AuthContext - HubSpot OAuth callback detected');
          try {
            const response = await ApiService.getCurrentUser();
            console.log('AuthContext - User fetched from OAuth callback:', response);
            setUser(response);
          } catch (error) {
            console.error('AuthContext - OAuth callback failed:', error);
          }
        } else {
          // Check if user is already authenticated
          console.log('AuthContext - Checking existing authentication');
          
          // Check if there's a token in localStorage
          const existingToken = localStorage.getItem('token');
          console.log('AuthContext - Existing token in localStorage:', !!existingToken);
          
          if (existingToken) {
            try {
              const response = await ApiService.getCurrentUser();
              console.log('AuthContext - User already authenticated:', response);
              setUser(response);
            } catch (error) {
              console.log('AuthContext - Token exists but user fetch failed:', error.message);
              // Clear invalid token
              localStorage.removeItem('token');
            }
          } else {
            // User not authenticated, that's okay for HubSpot app
            console.log('AuthContext - User not authenticated - HubSpot OAuth required');
          }
        }
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
    console.log('AuthContext - Initiating HubSpot OAuth');
    // Direct redirect to the OAuth URL
    const clientId = '6be1632d-8007-45e4-aecb-6ec93e6ff528';
    const redirectUri = 'https://api.workflowguard.pro/api/auth/hubspot/callback';
    const scopes = 'crm.schemas.deals.read automation oauth crm.objects.companies.read crm.objects.deals.read crm.schemas.contacts.read crm.objects.contacts.read crm.schemas.companies.read';
    
    const authUrl = `https://app-na2.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    
    console.log('AuthContext - Redirecting to:', authUrl);
    // Redirect immediately
    window.location.href = authUrl;
  };

  const testAuthentication = async () => {
    console.log('AuthContext - Testing authentication manually');
    const token = localStorage.getItem('token');
    console.log('AuthContext - Current token:', token ? token.substring(0, 50) + '...' : 'none');
    
    try {
      const response = await ApiService.getCurrentUser();
      console.log('AuthContext - Manual auth test successful:', response);
      setUser(response);
    } catch (error) {
      console.error('AuthContext - Manual auth test failed:', error);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    connectHubSpot,
    logout,
    isAuthenticated: !!user,
    testAuthentication, // Add this for debugging
  };

  console.log('AuthContext - Current state:', { user: !!user, loading, isAuthenticated: !!user, hasInitialized });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 