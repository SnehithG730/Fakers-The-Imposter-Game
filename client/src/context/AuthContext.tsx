import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession } from '../types';

interface AuthContextType {
  session: AuthSession | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('imposter_jwt_token');
    if (storedToken) {
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.session) {
            setSession(data.session);
            setToken(storedToken);
          } else {
            localStorage.removeItem('imposter_jwt_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('imposter_jwt_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setSession(data.session);
      setToken(data.token);
      localStorage.setItem('imposter_jwt_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network connection failed' };
    }
  };

  const logout = () => {
    setSession(null);
    setToken(null);
    localStorage.removeItem('imposter_jwt_token');
  };

  return (
    <AuthContext.Provider value={{ session, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
