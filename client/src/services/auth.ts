import axios from 'axios';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, UserCredential, sendEmailVerification, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getApps } from 'firebase/app';
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
const apps = getApps();
if (apps.length === 0) {
  initializeApp(firebaseConfig);
}
export const auth = getAuth();

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
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    provider.addScope('profile');
    provider.addScope('email');

    // Check if we're on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // For mobile, we just start the redirect flow
      await signInWithRedirect(auth, provider);
      return;
    } else {
      // For desktop, use popup
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
  } catch (error: any) {
    console.error('Google Signup Error:', error);
    throw error;
  }
};

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
    handleLoginError(error);
    throw error;
    
  }
};

export const signInWithGoogle = async (role: ClientRole): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    provider.addScope('profile');
    provider.addScope('email');

    // Check if we're on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // For mobile, we just start the redirect flow
      await signInWithRedirect(auth, provider);
      return null as any; // This will be handled by the redirect
    } else {
      // For desktop, use popup
      const result = await signInWithPopup(auth, provider) as UserCredential;
      if (!result.user) {
        throw new Error('No user data received from Google');
      }

      const idToken = await result.user.getIdToken();
      const email = result.user.email || '';
      const name = result.user.displayName || '';

      // For login, verify the token and get user data
      const response = await axios.post(`${API_URL}/api/auth/verify`, {
        idToken,
        role,
        email,
        name
      });

      return {
        token: idToken,
        user: {
          email: response.data.user.email,
          role: response.data.user.role,
          name: response.data.user.name
        },
        userExists: '1',
        roleExists: '1'
      };
    }
  } catch (error: any) {
    handleLoginError(error);
    throw error;
  }
};

export const refreshSession = async (setAuthSession: React.Dispatch<React.SetStateAction<Session | null>>) => {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        const idToken = tokenResult.token;

        setAuthSession({
          token: idToken,
          user: {
            name: user.displayName || null,
            email: user.email || null,
            role: tokenResult.claims.role as ClientRole || ClientRole.CUSTOMER
          }
        })
        localStorage.setItem('auth', JSON.stringify({
          token: idToken,
          user: {
            name: user.displayName || null,
            email: user.email || null,
            role: tokenResult.claims.role as ClientRole || ClientRole.CUSTOMER
          }
        }))
      } else {
        console.log("No user is signed in.");
      }
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to refresh session');
  }
}

export const handleLoginError = (error: any) => {
  if (error.response?.status === 403) {
    throw new UserRoleNotFoundError();
  }

  if (error.code === 'auth/wrong-password') {
    throw new Error('Incorrect password. Please try again.');
  }

  if (error.response?.status === 404 || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
    throw new UserNotFoundError();
  }
  
  console.error('Google Auth Error:', error);
}

export const logout = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('auth');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
};
