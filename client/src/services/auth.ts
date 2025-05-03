import axios from 'axios';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential, sendEmailVerification } from 'firebase/auth';
import { ClientRole, User } from '../context/types';
import { UserRoleExistsError } from '../exceptions/UserRoleExists';
import { auth } from '../context/authContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface AuthResponse {
  token: string;
  user: User
  userExists: '1' | '0';
  roleExists: '1' | '0';
}
export const signUp = async (email: string, password: string, role: ClientRole): Promise<AuthResponse> => {
  try {
    // 1. Create user in Firebase
    let userCredential: UserCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/signup`, {
      idToken,
      user: {
        email,
        name: '', // Can be updated later
        role
      }
    });

    await sendEmailVerification(userCredential!.user);

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
    if (error.response?.status === 409) {
      throw new UserRoleExistsError();
    }
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
    console.error('Login error:', error);
    
    // Handle specific Firebase error codes
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please sign up first.');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    
    // Handle API errors
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    if (error.response?.status === 403) {
      throw new Error('Unauthorized');
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
    throw error;
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
