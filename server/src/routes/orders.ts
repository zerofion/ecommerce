import express from 'express';
import { db, firebaseApp, OrderItem, OrderStatus, Product, UpdateOrderStatusRequest } from '../services/firebase';
import { Order } from '../services/firebase';
import { getUserRole } from '../services/firebase';
import { AuthenticatedRequest } from '../types/authenticated-request';

const router = express.Router();

// Middleware to check user role
const requireRole = (requiredRole: string[]) => {
  return async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
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

      if (!requiredRole.includes(role)) {
        return res.status(403).json({ error: `Role ${requiredRole} required` });
      }
      req.user = {
        uid: decodedToken.uid,
        role
      };
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Get single order
router.get('/user/:id', requireRole(['customer', 'b2b-customer']), async (req, res) => {
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
router.post('/', requireRole(['customer', 'b2b-customer']), async (req: AuthenticatedRequest, res) => {
  try {
    const { items } = req.body as { items: OrderItem[] };
    const customerId = req.user?.uid;


    // Group items by tenantId
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = [];
      }
      acc[item.vendorId].push(item);
      return acc;
    }, {} as { [key: string]: OrderItem[] });

    // Create separate orders for each tenant
    const orders = await Promise.all(
      Object.entries(groupedItems).map(async ([tenantId, items]) => {
        const orderRef = await db.collection('orders').add({
          customerId,
          vendorId: tenantId,
          products: items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          createdAt: new Date().toISOString(),
          status: 'pending',
          customerComment: '',
          vendorComment: '',
          role: req.user?.role,
          total: items.reduce((acc, item) => acc + item.price * item.quantity, 0)
        });

        return {
          id: orderRef.id,
          tenantId,
          itemsCount: items.length
        };
      })
    );

    res.status(201).json({
      message: 'Orders created successfully',
      orders: orders.map(order => ({
        id: order.id,
        vendorId: order.tenantId,
        itemsCount: order.itemsCount
      }))
    });

  } catch (error) {
    console.error('Error creating orders:', error);
    res.status(500).json({ error: 'Failed to create orders' });
  }
});

// Get user's orders (customer only)
router.get('/user', requireRole(['customer', 'b2b-customer']), async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('customerId', '==', req.user!.uid)
      .where('role', '==', req.user!.role)
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


// Update order status
router.put('/:id/status', requireRole(['customer', 'b2b-customer']), async (req: AuthenticatedRequest & { body: UpdateOrderStatusRequest }, res) => {
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
    if (order.customerId !== req.user!.uid) {
      return res.status(403).json({ error: 'Unauthorized - This order belongs to another customer' });
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['cancelled'] as OrderStatus[],
      accepted: ['cancelled'] as OrderStatus[],
      completed: [] as OrderStatus[],
      cancelled: ['cancelled'] as OrderStatus[]
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
      customerComment: order.customerComment ? order.customerComment + `\nOrder status changed to ${status} by customer`
        : `Order status changed to ${status} by customer`,
      updatedAt: new Date(),
      archived: true
    });

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update order comment
router.put('/:id/comment', requireRole(['customer', 'b2b-customer']), async (req: AuthenticatedRequest & { body: { comment: string } }, res) => {
  try {
    const { comment } = req.body;
    const orderRef = db.collection('orders').doc(req.params.id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderSnap.data() as Order;
    if (order.customerId !== req.user!.uid) {
      return res.status(403).json({ error: 'Unauthorized - This order belongs to another customer' });
    }
    await orderRef.update({
      customerComment: order.customerComment ? order.customerComment + `\n${comment}` : comment,
      updatedAt: new Date().toISOString()
    });

    
    res.json({
      id: orderSnap.id,
      ...orderSnap.data()
    } as Order);
  } catch (error) {
    console.error('Error updating order comment:', error);
    res.status(500).json({ error: 'Failed to update order comment' });
  }
});

export { router as ordersRouter };
