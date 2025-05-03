export interface User {
  name?: string;
  email: string;
  role: 'customer' | 'vendor' | 'b2b-customer';
}
