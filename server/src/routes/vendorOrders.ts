import express from 'express';
import { db } from '../services/firebase';
import { Order } from '../services/firebase';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { requireVendor } from '../middleware/authHandler';
import { OrderStatus, UpdateOrderStatusRequest } from '../services/firebase';


const router = express.Router();

// Get vendor's orders
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
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/:id/status', requireVendor, async (req: AuthenticatedRequest & { body: UpdateOrderStatusRequest }, res) => {
  try {
    const { status }: UpdateOrderStatusRequest = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the order
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderSnap.data() as Order;

    // Verify vendor ownership
    if (order.vendorId !== req.user!.uid) {
      return res.status(403).json({ error: 'Unauthorized - This order belongs to another vendor' });
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['accepted', 'cancelled'] as OrderStatus[],
      accepted: ['completed', 'cancelled'] as OrderStatus[],
      completed: [] as OrderStatus[],
      cancelled: ['accepted'] as OrderStatus[]
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status transition',
        message: `Cannot transition from ${order.status} to ${status}`
      });
    }

    // Update order status
    await orderRef.update({
      status,
      vendorComment: order.vendorComment ? order.vendorComment + `\nOrder status changed to ${status} by vendor` : `Order status changed to ${status} by vendor`,
      updatedAt: new Date()
    });

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update order comment
router.put('/:id/comment', requireVendor, async (req: AuthenticatedRequest & { body: { comment: string } }, res) => {
  try {
    const { comment } = req.body;
    const orderRef = db.collection('orders').doc(req.params.id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderSnap.data() as Order;
    await orderRef.update({
      vendorComment: order.vendorComment ? order.vendorComment + `\n${comment}` : comment,
      updatedAt: new Date().toISOString()
    });

    const doc = await orderRef.get();
    res.json({
      id: doc.id,
      ...doc.data()
    } as Order);
  } catch (error) {
    console.error('Error updating order comment:', error);
    res.status(500).json({ error: 'Failed to update order comment' });
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
