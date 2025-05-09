import express from 'express';
import { db } from '../services/firebase';
import { Product } from '../services/firebase';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { requireVendor } from '../middleware/authHandler';


const router = express.Router();

// Get all products
router.get('/', requireVendor, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('products')
      .where('tenantId', '==', req.user?.uid)
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
router.post('/create', requireVendor, async (req: AuthenticatedRequest, res) => {
  try {
    const productData = req.body as Partial<Product>;
    delete productData.id;
    delete productData.createdAt;
    const docRef = await db.collection('products').add({
      ...productData,
      tenantId: req.user?.uid,
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

router.post('/update', requireVendor, async (req: AuthenticatedRequest, res) => {
  try {
    const productData = req.body as Product;
    const docRef = db.collection('products').doc(productData.id);
    await docRef.update({
      ...productData,
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

export { router as vendorProductsRouter };
