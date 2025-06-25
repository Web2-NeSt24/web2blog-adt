import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First, ensure we have a CSRF token by making a request to get it
        // This sets the csrf cookie which we'll use for subsequent requests
        await fetch('/api/csrf', { credentials: 'include' });

        const response = await fetch('/api/user/me/profile', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User authenticated:', userData);
          setUser(userData.user || userData); // Handle different response formats
        } else {
          console.log('User not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Get CSRF token from cookie
  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  };

  const login = async (username: string, password: string) => {
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        register, 
        logout, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
