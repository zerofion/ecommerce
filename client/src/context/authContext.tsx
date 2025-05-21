import { createContext } from 'react';
import { AuthContextType, initialAuthTemplate } from './types';

export const AuthContext = createContext<AuthContextType>({
  authSession: initialAuthTemplate,
  setAuthSession: () => { },
  isLoading: false,
  setIsLoading: () => { },
  error: null,
  setError: () => { },
  setRole: () => { },
});



