import { User } from "../context/types";

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
  b2bMrpPerQuantity: number;
  paidCostPerQuantity: number;
  allowLoose: boolean;
  minQuantity: number;
  createdAt: string;
  updatedAt?: string;
  tenantId: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  vendorId: string;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
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
