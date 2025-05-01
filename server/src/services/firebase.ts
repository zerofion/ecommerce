import admin from 'firebase-admin';
import { config } from '../config';

// Initialize Firebase Admin
let app: admin.app.App;

try {
  app = admin.initializeApp({
    credential: admin.credential.cert(config.firebase.credential)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  throw error;
}

export const auth = admin.auth();
export const db = admin.firestore();

// Type definitions
export type Role = 'customer' | 'vendor' | 'b2b-customer' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  mrpPerQuantity: number;
  sellingPerQuantity: number;
  paidCostPerQuantity: number;
  allowLoose: boolean;
  minQuantity: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

// Helper functions
export const getUserRole = async (uid: string): Promise<Role> => {
  try {
    const user = await auth.getUser(uid);
    return user.customClaims?.role as Role || 'customer';
  } catch (error) {
    console.error('Failed to get user role:', error);
    throw error;
  }
};

export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const role = await getUserRole(uid);
    return role === 'admin';
  } catch (error) {
    console.error('Failed to check admin status:', error);
    throw error;
  }
};

// Export the app instance for token verification
export const firebaseApp = app;
