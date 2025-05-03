export type ClientRole = 'customer' | 'vendor' | 'b2b-customer';


export interface User {
  name?: string;
  email: string;
  role: ClientRole;
}
