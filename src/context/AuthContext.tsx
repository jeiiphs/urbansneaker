import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as authLogin } from '../services/auth';
import { API_ENDPOINTS } from '../config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    }
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const validateToken = async (token: string, retryCount = 0) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      if (!API_ENDPOINTS?.AUTH?.VALIDATE) {
        throw new Error('Invalid API endpoint configuration');
      }

      const response = await fetch(API_ENDPOINTS.AUTH.VALIDATE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token is invalid or expired - clear auth state
          throw new Error('Session expired. Please log in again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Token validation failed:', error.message);

      // Handle network errors with retry logic
      if (
        (error.message === 'Failed to fetch' || !navigator.onLine) &&
        retryCount < MAX_RETRIES
      ) {
        console.log(`Retrying token validation (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY);
        return validateToken(token, retryCount + 1);
      }

      // Clear authentication state on final failure
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      
      throw new Error(
        error.message === 'Failed to fetch'
          ? 'Network error. Please check your connection and try again.'
          : error.message || 'Authentication failed. Please log in again.'
      );
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await authLogin(email, password);
      localStorage.setItem('auth_token', token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prevUser) => prevUser ? { ...prevUser, ...updatedUser } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};