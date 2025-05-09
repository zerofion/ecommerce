import express from 'express';
import { db } from '../services/firebase';
import { Order } from '../services/firebase';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { requireVendor } from '../middleware/authHandler';

const router = express.Router();

// Get all orders (admin only)
router.get('/', requireVendor, async (req, res) => {
  try {
    const snapshot = await db.collection('orders').get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/user/:id', requireVendor, async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      id: doc.id,
      ...doc.data()
    } as Order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get user's orders (customer only)
router.get('/user', requireVendor, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('vendorId', '==', req.user!.uid)
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/:id/status', requireVendor, async (req, res) => {
  try {
    const { status } = req.body;
    const docRef = db.collection('orders').doc(req.params.id);
    await docRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    const doc = await docRef.get();
    res.json({
      id: doc.id,
      ...doc.data()
    } as Order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order (admin only)
router.delete('/:id', requireVendor, async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export { router as vendorOrdersRouter };
