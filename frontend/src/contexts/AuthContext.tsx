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

  // Debug logging helper
  const logAuth = (message: string, data?: any) => {
    console.log(`🔐 AuthContext - ${message}`, data ? data : '');
  };

  useEffect(() => {
    if (hasInitialized) {
      logAuth('Auth already initialized, skipping');
      return;
    }

    const initializeAuth = async () => {
      logAuth('Starting auth initialization');
      try {
        // Check for token in URL after OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const successParam = urlParams.get('success');
        const tokenParam = urlParams.get('token');
        const isMarketplace = urlParams.get('marketplace') === 'true';

        logAuth('URL parameters', { success: successParam, hasToken: !!tokenParam, isMarketplace });

        // Handle OAuth callback
        if (successParam === 'true' && tokenParam) {
          logAuth('Processing OAuth callback');
          localStorage.setItem('authToken', tokenParam);
          
          // Clean up URL without triggering a navigation
          const newUrl = window.location.pathname + 
            (urlParams.get('marketplace') === 'true' ? '?source=marketplace' : '');
          window.history.replaceState({}, document.title, newUrl);
          logAuth('Updated URL after OAuth', { newUrl });
        }

        const token = localStorage.getItem('authToken');
        logAuth('Checking token', { hasToken: !!token, tokenLength: token?.length });

        if (token) {
          logAuth('Validating token with API');
          // Add small delay to ensure token is properly set
          await new Promise(resolve => setTimeout(resolve, 100));
          try {
            const response = await ApiService.getCurrentUser();
            logAuth('API response received', { success: response.success });

            if (response.success && response.data) {
              logAuth('User validation successful', {
                userId: response.data.id,
                email: response.data.email,
                portalId: response.data.hubspotPortalId
              });
              setUser(response.data);

              // Don't redirect here - let the OnboardingFlow handle navigation
              if (successParam === 'true' && tokenParam) {
                logAuth('Fresh OAuth success, user authenticated');
              }
            } else {
              logAuth('Token validation failed', { response });
              localStorage.removeItem('authToken');
              setUser(null);
            }
          } catch (error) {
            logAuth('Token validation error', { error });
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } else {
          logAuth('No token found, user remains unauthenticated');
          setUser(null);
        }
      } catch (error) {
        logAuth('Auth initialization error', { 
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
        setHasInitialized(true);
        // Log after state is set
        setTimeout(() => {
          logAuth('Auth initialization complete', { 
            isAuthenticated: !!localStorage.getItem('authToken'),
            hasToken: !!localStorage.getItem('authToken'),
            userSet: !!user
          });
        }, 0);
      }
    };

    initializeAuth();
  }, [hasInitialized]);

  const connectHubSpot = async () => {
    logAuth('Initiating HubSpot connection');
    const currentUrl = window.location.href;
    logAuth('Connection context', { currentUrl });

    try {
      const resp = await fetch('/api/auth/hubspot/url', { credentials: 'include' });
      if (!resp.ok) {
        // If backend not configured, show a clear message
        logAuth('HubSpot not configured or endpoint error', { status: resp.status });
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
        logAuth('Unexpected response from /api/auth/hubspot/url', { data });
        toast({
          title: 'Unable to start HubSpot OAuth',
          description: 'Please try again later.',
        });
      }
    } catch (e) {
      logAuth('Error contacting /api/auth/hubspot/url', { e });
      toast({
        title: 'Network error',
        description: 'Cannot reach the server to start HubSpot OAuth. Check your network or try again.',
      });
    }
  };

  const testAuthentication = async () => {
    logAuth('Testing authentication');
    const token = localStorage.getItem('authToken');
    logAuth('Auth test state', { 
      hasToken: !!token,
      isAuthenticated: !!user,
      currentUrl: window.location.href
    });
    return;
  };

  const logout = async () => {
    logAuth('Logout initiated');
    try {
      // Clear auth state
      setUser(null);
      localStorage.removeItem('authToken');
      logAuth('Logout completed successfully');
    } catch (error) {
      logAuth('Logout error', { error });
      // Force logout even on error
      setUser(null);
      localStorage.removeItem('authToken');
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