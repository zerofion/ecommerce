import axios from 'axios';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential, sendEmailVerification, getAuth } from 'firebase/auth';
import { ClientRole, User, Session } from '../context/types';
import { UserRoleExistsError } from '../exceptions/UserRoleExists';
import { UserNotFoundError } from '../exceptions/UserNotFound';
import { UserRoleNotFoundError } from '../exceptions/UserRoleNotFoundError';
import { EmailNotVerifiedError } from '../exceptions/EmailNotVerifiedError';
import { initializeApp } from '@firebase/app';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

interface AuthResponse {
  token: string;
  user: User
  userExists: '1' | '0';
  roleExists: '1' | '0';
}
export const signUp = async (email: string, password: string, role: ClientRole) => {
  let userJustCreated = false;
  try {
    // 1. Create user in Firebase
    let userCredential: UserCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      userJustCreated = true;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Email already in use');
      }
    }
    const firebaseUser = userCredential!.user;

    // 2. Get ID token
    const idToken = await firebaseUser.getIdToken();

    // 3. Send to server to create user and set custom claims
    await axios.post(`${API_URL}/api/auth/signup`, {
      idToken,
      user: {
        email,
        name: '', // Can be updated later
        role
      }
    });

    if (userJustCreated) {
      await sendEmailVerification(userCredential!.user);
    }
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new UserRoleExistsError();
    }
    if (error.response?.status === 404 || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      throw new UserNotFoundError();
    }
    throw new Error(error.response?.data?.error?.message || 'Registration failed');
  }
};

export const signUpWithGoogle = async (role?: ClientRole) => {

  const provider = new GoogleAuthProvider();

  // Configure the provider with the required scopes
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  const result = await signInWithPopup(auth, provider) as UserCredential;

  if (!result.user) {
    throw new Error('No user data received from Google');
  }

  const idToken = await result.user.getIdToken();
  const email = result.user.email || '';
  const name = result.user.displayName || '';

  try {
    // First try to create a new user
    await axios.post(`${API_URL}/api/auth/signup`, {
      idToken,
      user: {
        email,
        role: role || 'customer',
        name,
        provider: 'google'
      }
    });
  } catch (error: any) {
    // If signup fails because user exists, try to log in
    if (error.response?.status === 409) {
      throw new UserRoleExistsError();
    }
    throw error;
  }
}

export const login = async (email: string, password: string, role: ClientRole): Promise<AuthResponse> => {
  try {
    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Get ID token from Firebase
    const idToken = await firebaseUser.getIdToken();

    const isEmailVerified = await firebaseUser.emailVerified;

    if (!isEmailVerified) {
      throw new EmailNotVerifiedError();
    }

    // 3. Send ID token to server for verification and get custom claims
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/verify`, { idToken, role });

    // 4. Return user data
    return {
      token: idToken,
      user: {
        email: firebaseUser.email || '',
        role: response.data.user.role,
        name: response.data.user.name || ''
      },
      userExists: '1',
      roleExists: '1'
    };
  } catch (error: any) {
    // Handle specific Firebase error codes
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }

    if (error.response?.status === 404 || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      throw new UserNotFoundError();
    }
    if (error.response?.status === 403) {
      throw new UserRoleNotFoundError();
    }
    throw error;
  }
};


export const signInWithGoogle = async (role: ClientRole): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();

    // Configure the provider with the required scopes
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider) as UserCredential;

    if (!result.user) {
      throw new Error('No user data received from Google');
    }

    const idToken = await result.user.getIdToken();
    const email = result.user.email || '';

    // For login, verify the token and get user data
    const response = await axios.post(`${API_URL}/api/auth/verify`, {
      idToken,
      role,
    });

    return {
      token: idToken,
      user: {
        email,
        role: response.data.user.role,
        name: response.data.user.name
      },
      userExists: '1',
      roleExists: '1'
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new UserNotFoundError();
    }
    if (error.response?.status === 403) {
      throw new UserRoleNotFoundError();
    }
    console.error('Google Auth Error:', error);
    throw error;
  }
};

export const refreshSession = async (setAuthSession: React.Dispatch<React.SetStateAction<Session | null>>) => {
  try {
    const idToken = await auth.currentUser?.getIdToken(true)
    setAuthSession({
      token: idToken || null,
      user: auth.currentUser ? {
        name: auth.currentUser.displayName || null,
        email: auth.currentUser.email || null,
        role: ClientRole.CUSTOMER // Default to CUSTOMER role until we get the actual role from the server
      } : null
    })
  } catch (error: any) {
    throw new Error(error.message || 'Failed to refresh session');
  }
}

export const logout = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('auth');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
};
