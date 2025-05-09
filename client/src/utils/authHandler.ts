import { getAuth, getRedirectResult } from 'firebase/auth';
import axios from 'axios';
import { ClientRole } from '../context/types';
import { API_URL } from '../config';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  token: string | null;
  user: {
    email: string;
    role: ClientRole;
    name: string;
  };
}

export const handleAuthRedirect = async (): Promise<void> => {
  try {
    const auth = getAuth();
    
    // First check if we have a pending redirect result
    const pendingResult = await getRedirectResult(auth);

    if (pendingResult) {
      // Get the user and credential from the pending result
      const user = pendingResult.user;
      const credential = pendingResult.credential;
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        console.error('No access token found in credential');
        return;
      }

      // Dispatch initial auth state with basic user info
      const initialAuthState: AuthState = {
        token: accessToken,
        user: {
          email: user.email || '',
          role: 'customer' as ClientRole,
          name: user.displayName || ''
        }
      };

      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: initialAuthState
      }));

      // Check if we have a role query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const role = urlParams.get('role') as ClientRole || 'customer' as ClientRole;

      try {
        // First try to verify the token
        const response = await axios.post(`${API_URL}/api/auth/verify`, {
          idToken: accessToken,
          role,
          email: user.email,
          name: user.displayName
        });

        // Update auth state with verified user info
        const verifiedAuthState: AuthState = {
          token: accessToken,
          user: {
            email: response.data.user.email,
            role: response.data.user.role as ClientRole,
            name: response.data.user.name
          }
        };

        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: verifiedAuthState
        }));
      } catch (error: unknown) {
        if (error instanceof Error && error.response?.status === 404) {
          try {
            // Create new user if not found
            await axios.post(`${API_URL}/api/auth/signup`, {
              idToken: accessToken,
              user: {
                email: user.email,
                role,
                name: user.displayName
              }
            });

            // Update auth state with new user info
            const newAuthState: AuthState = {
              token: accessToken,
              user: {
                email: user.email || '',
                role,
                name: user.displayName || ''
              }
            };

            window.dispatchEvent(new CustomEvent('authStateChanged', {
              detail: newAuthState
            }));
          } catch (error: unknown) {
            if (error instanceof Error) {
              console.error('Error during signup:', error.message);
            } else {
              console.error('Unknown error during signup');
            }
          }
        } else {
          if (error instanceof Error) {
            console.error('Error during verification:', error.message);
          } else {
            console.error('Unknown error during verification');
          }
        }
      }
    } else {
      console.log('No pending redirect result found');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in auth redirect handler:', error.message);
    } else {
      console.error('Unknown error in auth redirect handler');
    }
  }
};
