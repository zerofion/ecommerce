import axios from 'axios';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getRedirectResult, UserCredential } from 'firebase/auth';
import { FirebaseError, getApps, initializeApp } from 'firebase/app';
import { ClientRole, User } from '../context/types';

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

interface AuthResponse {
  token: string;
  user: User
  userExists: '1' | '0';
  roleExists: '1' | '0';
}
export const signUp = async (email: string, password: string, role: ClientRole): Promise<AuthResponse> => {
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
        name: '', // Can be updated later
        role
      }
    });

    return {
      token: response.data.token,
      user: {
        email,
        role,
        name: ''
      },
      userExists: '0',
      roleExists: '0'
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Registration failed');
  }
};

export const signUpWithGoogle = async (role?: ClientRole): Promise<AuthResponse> => {

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
      token: response.data.token,
      user: {
        email,
        role: response.data.user.role
      },
      userExists: '0',
      roleExists: '0'
    };
  } catch (error: any) {
    // If signup fails because user exists, try to log in
    if (error.response?.status === 409) {

      return {
        token: '',
        user: {
          email,
          role: role || 'customer'
        },
        userExists: '1',
        roleExists: '1'
      };
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

    // 3. Send ID token to server for verification and get custom claims
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/verify`, { idToken, role });

    // 4. Return user data
    return {
      token: response.data.token,
      user: {
        email: firebaseUser.email || '',
        role: response.data.user.role,
        name: response.data.user.name || ''
      },
      userExists: '1',
      roleExists: '1'
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return handleUserNotFound();
    }
    if (error.response?.status === 403) {
      return handleUserNotAuthorized();
    }
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      return handleUserNotFound();
    }
    if (error.code === 'auth/wrong-password') {
      return handleUserNotAuthorized();
    }
    throw new Error(error.response?.data?.error?.message || 'Authentication failed');
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
      token: response.data.token,
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
      return handleUserNotFound();
    }
    if (error.response?.status === 403) {
      return handleUserNotAuthorized();
    }
    console.error('Google Auth Error:', error);
    throw new Error(error.message || 'Failed to authenticate with Google. Please try again.');
  }
};

function handleUserNotFound(): AuthResponse {
  return {
    token: '',
    user: {
      email: '',
      role: 'customer'
    },
    userExists: '0',
    roleExists: '0'
  };
}

function handleUserNotAuthorized(): AuthResponse {
  return {
    token: '',
    user: {
      email: '',
      role: 'customer'
    },
    userExists: '1',
    roleExists: '0'
  };
}

export const logout = async () => {
  try {
    await auth.signOut();
    sessionStorage.removeItem('auth');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
};
