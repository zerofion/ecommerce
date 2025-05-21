export interface Session {
  user: User | null;
  token: string | null;
}

export enum ClientRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  B2B_CUSTOMER = 'b2b-customer'
}

export interface User {
  name?: string | null;
  email: string | null;
  role: ClientRole;
}

export const initialAuthTemplate: Session = {
  token: null,
  user: {
    name: null,
    email: null,
    role: ClientRole.CUSTOMER
  }
}

export interface AuthContextType {
  authSession: Session;
  setAuthSession: React.Dispatch<React.SetStateAction<Session>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: (role: ClientRole) => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}