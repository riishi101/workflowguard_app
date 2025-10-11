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
      try {
        // Check for token in URL after OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const successParam = urlParams.get('success');
        const tokenParam = urlParams.get('token');
        const errorParam = urlParams.get('error');
        const isMarketplace = urlParams.get('marketplace') === 'true';

        // Handle OAuth errors
        if (errorParam) {
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
          localStorage.setItem('token', tokenParam);
          
          // Clean up URL without triggering a navigation
          const newUrl = window.location.pathname + 
            (urlParams.get('marketplace') === 'true' ? '?source=marketplace' : '');
          window.history.replaceState({}, document.title, newUrl);
        }

        const token = localStorage.getItem('token');

        if (token) {
          // Add small delay to ensure token is properly set
          await new Promise(resolve => setTimeout(resolve, 100));
          try {
            const response = await ApiService.getCurrentUser();
            if (response.success && response.data) {
              setUser(response.data);

              // Don't redirect here - let the OnboardingFlow handle navigation
              if (successParam === 'true' && tokenParam) {
                }
            } else {
              localStorage.removeItem('token');
              setUser(null);
            }
          } catch (error: any) {
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = async () => {
    const currentUrl = window.location.href;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';
      const resp = await fetch(`${apiUrl}/api/auth/hubspot/url`, { credentials: 'include' });
      if (!resp.ok) {
        // If backend not configured, show a clear message
        
        toast({
          title: 'HubSpot not configured',
          description: 'Set HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET on your VPS, then try again.',
        });
        return;
      }
      const data = await resp.json().catch(() => null as any);
      if (data && data.url) {
        window.location.href = data.url as string;
      } else {
        
        toast({
          title: 'Unable to start HubSpot OAuth',
          description: 'Please try again later.',
        });
      }
    } catch (e) {
      
      toast({
        title: 'Network error',
        description: 'Cannot reach the server to start HubSpot OAuth. Check your network or try again.',
      });
    }
  };

  const testAuthentication = async () => {
    const token = localStorage.getItem('token');
    return;
  };

  const logout = async () => {
    try {
      // Clear auth state
      setUser(null);
      localStorage.removeItem('token');
      
    } catch (error) {
      
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};