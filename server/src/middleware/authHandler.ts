import express from 'express';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { firebaseApp } from '../services/firebase';
import { isVendor } from '../services/firebase';

export const requireVendor = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    const decodedToken = await firebaseApp.auth().verifyIdToken(token);
    const isAdmin = await isVendor(decodedToken.uid);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach user details to request object
    req.user = {
      uid: decodedToken.uid,
      role: decodedToken.role as string
    };
    next();
  } catch (error: any) {
    console.error('Admin check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};