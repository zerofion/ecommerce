import React, { createContext, useState, useEffect } from 'react';
import { API_URL, refreshSession } from '../services/auth';
import axios from 'axios';
import { Session } from './types';

export interface AuthContextType {
  authSession: Session | null;
  setAuthSession: React.Dispatch<React.SetStateAction<Session | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  authSession: null,
  setAuthSession: () => { },
  isLoading: false,
  setIsLoading: () => { },
  error: null,
  setError: () => { },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const persistedAuth = localStorage.getItem('auth');
  const initialAuth = persistedAuth ? JSON.parse(persistedAuth) : null;

  const [authSession, setAuthSession] = useState<Session | null>(initialAuth || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authSession) {
      const verifyToken = async () => {
        await axios.post(`${API_URL}/api/auth/verify`, {
          idToken: authSession.token,
          role: authSession?.user?.role,
        });
      };
      try {
        verifyToken();
      } catch (error: any) {
        if (error.response?.status === 401) {
          refreshSession(setAuthSession);
        }
      }
    }
  }, [authSession]);

  return (
    <AuthContext.Provider value={{
      authSession, setAuthSession,
      isLoading, setIsLoading, error, setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
