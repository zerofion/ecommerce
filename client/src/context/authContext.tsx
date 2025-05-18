import React, { createContext, useState, useEffect } from 'react';
import { API_URL, logout } from '../services/auth';
import axios from 'axios';
import { ClientRole, Session } from './types';
import { handleAuthRedirect } from '../utils/authHandler';
import { getAuth, getRedirectResult } from '@firebase/auth';

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
  const initialAuth = persistedAuth ? JSON.parse(persistedAuth) : {
    idToken: null,
    user: {
      name: null,
      email: null,
      role: ClientRole.CUSTOMER
    }
  };

  const [authSession, setAuthSession] = useState<Session | null>(initialAuth || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  function authChangeHandler() {
    if (authSession?.token) {
      const verifyToken = async () => {
        try {
          await axios.post(`${API_URL}/api/auth/verify`, {
            idToken: authSession.token,
            role: authSession?.user?.role,
          });
          localStorage.setItem('auth', JSON.stringify({
            token: authSession.token,
            user: {
              name: authSession.user?.name || null,
              email: authSession.user?.email || null,
              role: authSession.user?.role || ClientRole.CUSTOMER
            }
          }))
        } catch (error: any) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      };
      verifyToken();
      setIsLoading(false);
    } else if (isMobile) {
      localStorage.setItem('auth', JSON.stringify({
        token: null,
        user: {
          name: null,
          email: null,
          role: authSession?.user?.role || ClientRole.CUSTOMER
        }
      }))
      console.log('Mobile device detected');
      console.log("authSession");
      const handleRedirect = async () => {
        const auth = getAuth();
        const result = await getRedirectResult(auth);
        console.log("result");
        console.log(result);
        console.log("isLoading");
        console.log(isLoading);
        if (result) {
          const updatedAuthSession = await handleAuthRedirect(result, authSession);
          setAuthSession(updatedAuthSession);
          localStorage.setItem('auth', JSON.stringify({
            token: updatedAuthSession.token,
            user: {
              name: updatedAuthSession.user?.name || null,
              email: updatedAuthSession.user?.email || null,
              role: updatedAuthSession.user?.role || ClientRole.CUSTOMER
            }
          }))
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
      handleRedirect();
    }
    else {
      localStorage.setItem('auth', JSON.stringify({
        token: null,
        user: {
          name: null,
          email: null,
          role: authSession?.user?.role || ClientRole.CUSTOMER
        }
      }))
      setIsLoading(false);
    }
  }

  useEffect(() => {
    authChangeHandler();
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
