import axios from 'axios';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getRedirectResult, UserCredential } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { User, User as UserType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();

type UserRole = 'customer' | 'vendor' | 'b2b-customer';

interface AuthResponse {
  token: string;
  user: User;
}

interface GoogleAuthResponse {
  user: User
  userAlreadyExists: boolean;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Get ID token from Firebase
    const idToken = await firebaseUser.getIdToken();

    // 3. Send ID token to server for verification and get custom claims
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/verify`, { idToken });

    // 4. Return user data
    return {
      token: idToken,
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: response.data.user.role,
        name: response.data.user.name || ''
      }
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Authentication failed');
  }
};

export const signUp = async (email: string, password: string, role: UserRole): Promise<AuthResponse> => {
  try {
    // 1. Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Get ID token
    const idToken = await firebaseUser.getIdToken();

    // 3. Send to server to create user and set custom claims
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/signup`, {
      idToken,
      user: {
        email,
        role,
        name: '' // Can be updated later
      }
    });

    return {
      token: idToken,
      user: {
        id: firebaseUser.uid,
        email,
        role,
        name: ''
      }
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Registration failed');
  }
};

export const signUpWithGoogle = async (role?: 'customer' | 'vendor' | 'b2b-customer'): Promise<GoogleAuthResponse> => {

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
    const response = await axios.post(`${API_URL}/api/auth/signup`, {
      idToken,
      user: {
        email,
        role: role || 'customer',
        name,
        provider: 'google'
      }
    });

    return {
      user: {
        id: result.user.uid,
        email,
        role: response.data.user.role
      },
      userAlreadyExists: false
    };
  } catch (error: any) {
    // If signup fails because user exists, try to log in
    if (error.response?.status === 409) {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        idToken,
        provider: 'google'
      });

      return {
        user: {
          id: result.user.uid,
          email,
          role: response.data.user.role
        },
        userAlreadyExists: true
      };
    }
    throw error;
  }
}

export const signInWithGoogle = async (role?: 'customer' | 'vendor' | 'b2b-customer'): Promise<GoogleAuthResponse> => {
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
        provider: 'google'
      });

      return {
        user: {
          id: result.user.uid,
          email,
          role: response.data.user.role
        },
        userAlreadyExists: true
      };
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    throw new Error(error.message || 'Failed to authenticate with Google. Please try again.');
  }
};

// Get user data from server
export const getUser = async (): Promise<UserType> => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('No user authenticated');
    }

    const response = await axios.get<AuthResponse>(`${API_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });

    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to get user data');
  }
};
