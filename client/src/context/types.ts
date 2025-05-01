export interface User {
  uid: string;
  email: string;
  role: 'customer' | 'vendor' | 'b2b-customer';
}
