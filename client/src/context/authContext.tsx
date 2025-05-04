import React, { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { User } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export interface Auth {
  user: User | null;
  token: string | null;
}

export interface AuthContextType {
  authSession: Auth | null;
  setAuthSession: React.Dispatch<React.SetStateAction<Auth | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const AuthContext = createContext<AuthContextType>({
  authSession: null,
  setAuthSession: () => { },
  isLoading: true,
  setIsLoading: () => { },
  error: null,
  setError: () => { },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const persistedAuth = sessionStorage.getItem('auth');
  const initialAuth = persistedAuth ? JSON.parse(persistedAuth) : null;

  const [authSession, setAuthSession] = useState<Auth | null>(initialAuth || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (authSession) {
      sessionStorage.setItem('auth', JSON.stringify({
        user: authSession.user,
        token: authSession.token
      }));
    } else {
      sessionStorage.removeItem('auth');
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
