import express from 'express';
import { db, firebaseApp } from '../services/firebase';
import { Order } from '../services/firebase';
import { getUserRole } from '../services/firebase';

const router = express.Router();

// Middleware to check user role
const requireRole = (requiredRole: string) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
      const role = await getUserRole(decodedToken.uid);

      if (role !== requiredRole) {
        return res.status(403).json({ error: `Role ${requiredRole} required` });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Get all orders (admin only)
router.get('/', requireRole('admin'), async (req, res) => {
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

// Get user's orders (customer only)
router.get('/user', requireRole('customer'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await firebaseApp.auth().verifyIdToken(token);

    const snapshot = await db.collection('orders')
      .where('customerId', '==', decodedToken.uid)
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

// Get single order
router.get('/:id', async (req, res) => {
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

// Create order (customer only)
router.post('/', requireRole('customer'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await firebaseApp.auth().verifyIdToken(token);

    const orderData = req.body as Omit<Order, 'id' | 'customerId' | 'createdAt'>;
    const docRef = await db.collection('orders').add({
      ...orderData,
      customerId: decodedToken.uid,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    
    const doc = await docRef.get();
    res.status(201).json({
      id: doc.id,
      ...doc.data()
    } as Order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status (admin only)
router.put('/:id/status', requireRole('admin'), async (req, res) => {
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
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export { router as ordersRouter };
