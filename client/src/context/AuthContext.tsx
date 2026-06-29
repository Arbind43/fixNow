import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios default config
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// We will set up interceptors inside the provider so we can access logout

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fixnow_token'));
  const [isLoading, setIsLoading] = useState(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('fixnow_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('fixnow_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  useEffect(() => {
    // 1. Setup Request Interceptor
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('fixnow_token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    // 2. Setup Response Interceptor to catch 401
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Ignore 401 on login route itself
          if (error.config.url && !error.config.url.includes('/auth/login')) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
