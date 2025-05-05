export enum ClientRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  B2B_CUSTOMER = 'b2b-customer'
}

export interface User {
  name?: string;
  email: string;
  role: ClientRole;
}
