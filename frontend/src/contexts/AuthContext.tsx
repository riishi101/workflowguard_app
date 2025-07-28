import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  connectHubSpot: (code: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const token = ApiService.getAuthToken();
        if (token) {
          const userData = await ApiService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token is invalid, remove it
        ApiService.removeAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await ApiService.login({ email, password });
      ApiService.setAuthToken(token);
      setUser(userData);
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { token, user: userData } = await ApiService.register({ email, password, name });
      ApiService.setAuthToken(token);
      setUser(userData);
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    }
  };

  const logout = () => {
    ApiService.removeAuthToken();
    setUser(null);
  };

  const connectHubSpot = async (code: string) => {
    try {
      await ApiService.connectHubSpot(code);
      // Refresh user data after HubSpot connection
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      throw new Error('Failed to connect HubSpot account.');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    connectHubSpot,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 