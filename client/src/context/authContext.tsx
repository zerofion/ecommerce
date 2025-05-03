import React, { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
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
  auth: Auth | null;
  setAuth: React.Dispatch<React.SetStateAction<Auth | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Initialize Firebase
initializeApp(firebaseConfig);

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => { },
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

  const [auth, setAuth] = useState<Auth | null>(initialAuth || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (auth) {
      sessionStorage.setItem('auth', JSON.stringify({
        user: auth.user,
        token: auth.token
      }));
    } else {
      sessionStorage.removeItem('auth');
    }
  }, [auth]);


  return (
    <AuthContext.Provider value={{
      auth, setAuth,
      isLoading, setIsLoading, error, setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
