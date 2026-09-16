import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession } from '../types';

interface AuthContextType {
  session: AuthSession | null;
  token: string | null;
  isLoading: boolean;
  login: (
    userNameOrTeam: string,
    teamNameOrPassword: string,
    passwordOrUndefined?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('imposter_jwt_token');
    if (storedToken) {
      // Verify token with backend
      fetch(`${API_BASE}/api/auth/me`, {
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

  const login = async (
    userNameOrTeam: string,
    teamNameOrPassword: string,
    passwordOrUndefined?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let bodyPayload: { playerName?: string; teamName: string; password: string };
      if (passwordOrUndefined !== undefined) {
        // Called as login(playerName, teamName, password)
        bodyPayload = {
          playerName: userNameOrTeam.trim(),
          teamName: teamNameOrPassword.trim(),
          password: passwordOrUndefined
        };
      } else {
        // Called as login(teamName, password)
        bodyPayload = {
          teamName: userNameOrTeam.trim(),
          password: teamNameOrPassword
        };
      }

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
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
