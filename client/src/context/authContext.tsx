import React, { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { User, ClientRole } from './types';

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
  const persistedAuth = localStorage.getItem('auth');
  const initialAuth = persistedAuth ? JSON.parse(persistedAuth) : null;

  const [authSession, setAuthSession] = useState<Auth | null>(initialAuth || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (!idTokenResult) {
            throw new Error('ID token result not found');
          }
          
          // Update auth session with fresh token
          const role = idTokenResult.claims.role as string;
          const sessionDetails = {
            user: {
              email: user.email,
              name: user.displayName,
              role: role as ClientRole
            },
            token: idTokenResult.token
          };

          setAuthSession(sessionDetails);
          localStorage.setItem('auth', JSON.stringify(sessionDetails));
        } catch (error) {
          console.error('Token verification failed:', error);
          setError('Token verification failed');
          setAuthSession(null);
          localStorage.removeItem('auth');
        }
      } else {
        setAuthSession(null);
        localStorage.removeItem('auth');
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <AuthContext.Provider value={{
      authSession, setAuthSession,
      isLoading, setIsLoading, error, setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
