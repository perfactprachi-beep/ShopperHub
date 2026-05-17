import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool } from './db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Security headers with CSP for Google Fonts + Razorpay
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "https://checkout.razorpay.com"],
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "https:"],
      connectSrc:     ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      frameSrc:       ["'self'", "https://api.razorpay.com"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Gzip all responses
app.use(compression());

// CORS — allow configured CLIENT_URL; in dev also allow any localhost port
const allowedOrigin = (origin, cb) => {
  if (!origin) return cb(null, true);
  const isLocal = /^http:\/\/localhost:\d+$/.test(origin);
  if (isLocal || origin === process.env.CLIENT_URL) return cb(null, true);
  cb(new Error(`CORS: ${origin} not allowed`));
};
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
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
import offersRoutes from './routes/offers.routes.js';
import adminRoutes from './routes/admin.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import storeRoutes from './routes/stores.routes.js';

app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/brands',        brandRoutes);
app.use('/api/banners',       bannerRoutes);
app.use('/api/home',          homeRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/account',       accountRoutes);
app.use('/api/coupons',       couponsRoutes);
app.use('/api/payments',      paymentsRoutes);
app.use('/api/orders',        ordersRoutes);
app.use('/api/reviews',       reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/offers',        offersRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/inventory',     inventoryRoutes);
app.use('/api/stores',        storeRoutes);

// Liveness
app.get('/api/health', (_req, res) => {
  res.json({ success: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Readiness — verify DB is reachable
app.get('/api/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, db: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, db: 'unavailable' });
  }
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
