export interface Session {
  user: User | null;
  token: string | null;
}

export enum ClientRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  B2B_CUSTOMER = 'b2b-customer'
}

export interface User {
  name?: string | null;
  email: string | null;
  role: ClientRole;
}
