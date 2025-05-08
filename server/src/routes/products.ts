import express from 'express';
import { db, firebaseApp, isCustomer } from '../services/firebase';
import { Product } from '../services/firebase';
import { AuthenticatedRequest } from '../types/authenticated-request';


const router = express.Router();

// Middleware to check admin role
const requireCustomer = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
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
    const isCustomerFlag = await isCustomer(decodedToken.uid);

    if (!isCustomerFlag) {
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

// Get all products
router.get('/', requireCustomer, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('products')
      .where('tenantId', '!=', req.user?.uid)
      .get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', requireCustomer, async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      id: doc.id,
      ...doc.data()
    } as Product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});


export { router as productsRouter };
