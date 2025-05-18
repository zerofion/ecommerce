import { UserCredential } from 'firebase/auth';
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

export const handleAuthRedirect = async (result: UserCredential, authSession: Session | null ): Promise<Session> => {
  try {
    // Get the user and credential from the pending result
    const user = result.user;
    const idToken = await user.getIdToken();

    if (!idToken) {
      throw new Error('No id token received');
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
      return authState;
    } catch (error: unknown) {
      handleLoginError(error);
      throw error;
    }

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in auth redirect handler:', error.message);
    } else {
      console.error('Unknown error in auth redirect handler');
    }
    throw error;
  }
};
