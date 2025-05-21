import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, UserCredential, sendEmailVerification, getAuth } from 'firebase/auth';
import { getApps } from 'firebase/app';
import { ClientRole, Session } from '../context/types';
import { EmailNotVerifiedError } from '../exceptions/EmailNotVerifiedError';
import { initializeApp } from '@firebase/app';
import { signUpWithApp, verifyAuthSession } from '../utils/authApiUtils';
import { getGoogleProvider, handleSignUpError } from '../utils/authUtils';
import { isMobile } from '../utils/appUtils';
import { firebaseConfig } from '../config';
import { UserNotFoundError } from '../exceptions/UserNotFound';

export const API_URL = import.meta.env.VITE_API_URL;

// Initialize Firebase
const apps = getApps();
if (apps.length === 0) {
  initializeApp(firebaseConfig);
}
export const auth = getAuth();

interface AuthResponse {
  session: Session;
  userExists: '1' | '0';
  roleExists: '1' | '0';
}

export const signUp = async (email: string, password: string, role: ClientRole) => {
  let userJustCreated = false;
  try {

    let userCredential: UserCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      userJustCreated = true;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
    }

    const firebaseUser = userCredential!.user;
    const idToken = await firebaseUser.getIdToken();

    await signUpWithApp({
      token: idToken,
      user: {
        email: firebaseUser.email || '',
        role,
        name: firebaseUser.displayName || '',
      }
    });

    if (userJustCreated) {
      await sendEmailVerification(userCredential!.user);
    }
  } catch (error: any) {
    handleSignUpError(error);
  }
};

export const signUpWithGoogle = async (role?: ClientRole) => {
  try {
    const provider = getGoogleProvider();
    if (isMobile()) {
      localStorage.setItem('signUp', 'true')
      await signInWithRedirect(auth, provider);
      return;
    } else {
      const result = await signInWithPopup(auth, provider) as UserCredential;
      if (!result.user) {
        throw new Error('No user data received from Google');
      }
      await signUpWithApp({
        token: await result.user.getIdToken(),
        user: {
          email: result.user.email || '',
          role: role || ClientRole.CUSTOMER,
          name: result.user.displayName || '',
        }
      });
    }
  } catch (error) {
    handleSignUpError(error);
  }
};

export const login = async (email: string, password: string, role: ClientRole): Promise<AuthResponse> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  if (!firebaseUser) {
    throw new UserNotFoundError();
  }

  const idToken = await firebaseUser.getIdToken();
  const isEmailVerified = await firebaseUser.emailVerified;

  if (!isEmailVerified) {
    throw new EmailNotVerifiedError();
  }

  const updatedAuthSession = await verifyAuthSession({
    idToken,
    role
  });

  return {
    session: updatedAuthSession,
    userExists: '1',
    roleExists: '1'
  };
};

export const signInWithGoogle = async (role: ClientRole): Promise<AuthResponse> => {
  const provider = getGoogleProvider();
  
  if (isMobile()) {
    await signInWithRedirect(auth, provider);
    return null as any;
  } else {
    const result = await signInWithPopup(auth, provider) as UserCredential;
    if (!result.user) {
      throw new Error('No user data received from Google');
    }
    const idToken = await result.user.getIdToken();
    const updatedAuthSession = await verifyAuthSession({
      idToken,
      role
    });

    return {
      session: updatedAuthSession,
      userExists: '1',
      roleExists: '1'
    };
  }
};


export const logout = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('auth');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
};
