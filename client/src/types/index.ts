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

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'customer' | 'vendor' | 'b2b-customer';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
}
