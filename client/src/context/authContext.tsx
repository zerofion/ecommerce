import React, { createContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { User } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export interface AuthContextType {
  user: User | null;
  authToken: string | null;
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => { },
  setIsLoading: () => { },
  error: null,
  setError: () => { },
  authToken: null,
  setAuthToken: () => { },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const persistedAuth = sessionStorage.getItem('auth');
  const initialAuth = persistedAuth ? JSON.parse(persistedAuth) : null;

  const [user, setUser] = useState<User | null>(initialAuth?.user || null);
  const [authToken, setAuthToken] = useState<string | null>(initialAuth?.authToken || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (user && authToken) {
      sessionStorage.setItem('auth', JSON.stringify({
        user,
        authToken
      }));
    } else {
      sessionStorage.removeItem('auth');
    }
  }, [user, authToken]);


  return (
    <AuthContext.Provider value={{
      user, authToken, setAuthToken,
      isLoading, setUser, setIsLoading, error, setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
