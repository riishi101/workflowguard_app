import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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
    if (hasInitialized) {
      return;
    }

    const initializeAuth = async () => {
      console.log('Initializing auth context...');
      
      try {
        // Check for token in URL after OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const successParam = urlParams.get('success');
        const tokenParam = urlParams.get('token');
        const errorParam = urlParams.get('error');
        const isMarketplace = urlParams.get('marketplace') === 'true';

        console.log('URL params:', { successParam, tokenParam, errorParam, isMarketplace });

        // Handle OAuth errors
        if (errorParam) {
          console.error('OAuth error detected:', errorParam);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          let errorMessage = 'Authentication failed';
          switch (errorParam) {
            case 'user_creation_failed':
              errorMessage = 'Failed to create user account. Please try again.';
              break;
            case 'oauth_failed':
              errorMessage = 'OAuth authentication failed. Please try again.';
              break;
            case 'config_error':
              errorMessage = 'HubSpot configuration error. Please contact support.';
              break;
            case 'token_error':
              errorMessage = 'Token exchange failed. Please try again.';
              break;
            default:
              errorMessage = `Authentication error: ${errorParam}`;
          }
          
          toast({
            title: 'Authentication Error',
            description: errorMessage,
            variant: 'destructive'
          });
          
          setLoading(false);
          setHasInitialized(true);
          return;
        }

        // Handle OAuth callback
        if (successParam === 'true' && tokenParam) {
          console.log('Handling OAuth callback with token');
          
          localStorage.setItem('token', tokenParam);
          
          // Clean up URL without triggering a navigation
          const newUrl = window.location.pathname + 
            (urlParams.get('marketplace') === 'true' ? '?source=marketplace' : '');
          window.history.replaceState({}, document.title, newUrl);
        }

        const token = localStorage.getItem('token');
        console.log('Current token status:', token ? 'Token exists' : 'No token found');

        if (token) {
          // Add small delay to ensure token is properly set
          await new Promise(resolve => setTimeout(resolve, 100));
          try {
            console.log('Fetching current user...');
            const response = await ApiService.getCurrentUser();
            console.log('Current user response:', response);
            
            if (response.success && response.data) {
              console.log('User authenticated successfully:', response.data);
              setUser(response.data);

              // Don't redirect here - let the OnboardingFlow handle navigation
              if (successParam === 'true' && tokenParam) {
                console.log('OAuth callback completed successfully');
              }
            } else {
              console.warn('Invalid user response, removing token');
              localStorage.removeItem('token');
              setUser(null);
            }
          } catch (error: any) {
            console.error('Error fetching current user:', error);
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          console.log('No token found, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        console.log('Auth initialization complete');
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = async () => {
    console.log('Initiating HubSpot connection...');
    const currentUrl = window.location.href;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';
      console.log('API URL:', apiUrl);
      
      const resp = await fetch(`${apiUrl}/api/auth/hubspot/url`, { credentials: 'include' });
      console.log('HubSpot URL response:', resp.status, resp.statusText);
      
      if (!resp.ok) {
        console.error('HubSpot configuration error');
        
        toast({
          title: 'HubSpot not configured',
          description: 'Set HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET on your VPS, then try again.',
        });
        return;
      }
      
      const data = await resp.json().catch(() => null as any);
      console.log('HubSpot URL data:', data);
      
      if (data && data.url) {
        console.log('Redirecting to HubSpot OAuth URL');
        window.location.href = data.url as string;
      } else {
        console.error('No URL in HubSpot response');
        
        toast({
          title: 'Unable to start HubSpot OAuth',
          description: 'Please try again later.',
        });
      }
    } catch (e) {
      console.error('Network error during HubSpot connection:', e);
      
      toast({
        title: 'Network error',
        description: 'Cannot reach the server to start HubSpot OAuth. Check your network or try again.',
      });
    }
  };

  const testAuthentication = async () => {
    console.log('Testing authentication...');
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    return;
  };

  const logout = async () => {
    console.log('Logging out...');
    
    try {
      // Clear auth state
      setUser(null);
      localStorage.removeItem('token');
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Force logout even on error
      setUser(null);
      localStorage.removeItem('token');
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

  console.log('AuthContext value:', { user, loading, isAuthenticated: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};