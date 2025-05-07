import express from 'express';
import { db, firebaseApp, isVendor } from '../services/firebase';
import { Product } from '../services/firebase';
import { AuthenticatedRequest } from '../types/authenticated-request';


const router = express.Router();

// Middleware to check admin role
const requireVendor = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
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
      role: decodedToken.claims.role as string
    };
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
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
router.get('/:id', async (req, res) => {
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

// Create product (admin only)
router.post('/', requireVendor, async (req, res) => {
  try {
    const productData = req.body as Omit<Product, 'id' | 'createdAt'>;
    const docRef = await db.collection('products').add({
      ...productData,
      createdAt: new Date().toISOString()
    });
    
    const doc = await docRef.get();
    res.status(201).json({
      id: doc.id,
      ...doc.data()
    } as Product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', requireVendor, async (req, res) => {
  try {
    const updates = req.body;
    const docRef = db.collection('products').doc(req.params.id);
    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const doc = await docRef.get();
    res.json({
      id: doc.id,
      ...doc.data()
    } as Product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', requireVendor, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export { router as productsRouter };
