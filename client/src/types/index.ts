import { ClientRole, User } from "../context/types";

export type OrderStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  vendorId: string;
}

export interface Order {
  id: string;
  customerId: string;
  role: ClientRole;
  vendorId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  vendorComment?: string;
  customerComment?: string;
  archived?: boolean;
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
  b2bPricePerQuantity: number;
  paidCostPerQuantity: number;
  allowLoose: boolean;
  minQuantity: number;
  createdAt: string;
  updatedAt?: string;
  tenantId: string;
}

export const categories = [
  "",
  "grocery",
  "dairy",
  "beverages"
]

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
}
