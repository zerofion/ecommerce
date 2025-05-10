import express from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './routes/auth';
import { vendorProductsRouter } from './routes/vendorProducts';
import { errorHandler } from './middleware/errorHandler';
import { ordersRouter } from './routes/orders';
import { productsRouter } from './routes/products';
import { vendorOrdersRouter } from './routes/vendorOrders';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vendor/products', vendorProductsRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/vendor/orders', vendorOrdersRouter);

// Error handling middleware
app.use(errorHandler);
console.log('Current working directory:', process.cwd());

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
