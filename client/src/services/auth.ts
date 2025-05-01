import axios from 'axios';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { User as UserType } from '../types';

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
  user: UserType;
}

interface AuthErrorResponse {
  error: {
    message: string;
  };
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
