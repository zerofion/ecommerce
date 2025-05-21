import axios from 'axios';
import { ClientRole, Session } from '../context/types';
import { API_URL } from '../config';
import { handleLoginError, handleSignUpError } from './authUtils';

export async function verifyAuthSession({ idToken, role }: { idToken: string, role: ClientRole }): Promise<Session> {

  if (!idToken) {
    throw new Error('No id token received');
  }

  try {
    const response = await axios.post(`${API_URL}/api/auth/verify`, {
      idToken: idToken,
      role: role,
    });

    const authState: Session = {
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

};

export async function signUpWithApp(session: Session) {
  try {
    await axios.post(`${API_URL}/api/auth/signup`, session);
  } catch (error: unknown) {
    handleSignUpError(error);
  }
}
