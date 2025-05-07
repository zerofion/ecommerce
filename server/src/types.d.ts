import { DecodedIdToken } from 'firebase-admin/auth';

declare namespace Express {
  interface Request {
    user?: {
      uid: string;
      role: string;
    };
  }
}
