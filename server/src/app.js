import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow configured origin; in dev also allow any localhost port
const allowedOrigin = (origin, cb) => {
  if (!origin) return cb(null, true); // server-to-server / curl
  const isLocal = /^http:\/\/localhost:\d+$/.test(origin);
  if (isLocal || origin === process.env.CLIENT_URL) return cb(null, true);
  cb(new Error(`CORS: ${origin} not allowed`));
};
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Global rate limit: 100 req / 15 min
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Auth-specific rate limit: 10 req / 1 min
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import brandRoutes from './routes/brands.routes.js';
import bannerRoutes from './routes/banners.routes.js';
import homeRoutes from './routes/home.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import accountRoutes from './routes/account.routes.js';
import couponsRoutes from './routes/coupons.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands',     brandRoutes);
app.use('/api/banners',    bannerRoutes);
app.use('/api/home',       homeRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/account',    accountRoutes);
app.use('/api/coupons',    couponsRoutes);
app.use('/api/payments',      paymentsRoutes);
app.use('/api/orders',        ordersRoutes);
app.use('/api/reviews',       reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
