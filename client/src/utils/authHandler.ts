import { getAuth, getRedirectResult } from 'firebase/auth';
import axios from 'axios';
import { ClientRole, Session } from '../context/types';
import { API_URL } from '../config';
import { handleLoginError } from '../services/auth';

interface AuthState {
  token: string | null;
  user: {
    email: string;
    role: ClientRole;
    name: string;
  };
}

export const handleAuthRedirect = async (authSession: Session | null,
  setAuthSession: React.Dispatch<React.SetStateAction<Session | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>): Promise<void> => {
  try {
    const auth = getAuth();
    setIsLoading(true);

    // First check if we have a pending redirect result
    const pendingResult = await getRedirectResult(auth);
 
    if (pendingResult) {
      // Get the user and credential from the pending result
      const user = pendingResult.user;
      const idToken = await user.getIdToken();

      if (!idToken) {
        return;
      }

      try {
        // First try to verify the token
        const response = await axios.post(`${API_URL}/api/auth/verify`, {
          idToken: idToken,
          role: authSession?.user?.role || 'customer',
          email: user.email,
          name: user.displayName
        });

        const authState: AuthState = {
          token: idToken,
          user: {
            email: response.data.user.email,
            role: response.data.user.role,
            name: response.data.user.name
          }
        };
        localStorage.setItem('auth', JSON.stringify(authState));
        setAuthSession(authState);
      } catch (error: unknown) {
        handleLoginError(error);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in auth redirect handler:', error.message);
    } else {
      console.error('Unknown error in auth redirect handler');
    }
  }
};
