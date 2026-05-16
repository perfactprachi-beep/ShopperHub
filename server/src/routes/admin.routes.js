import { Router } from 'express';
import path from 'path';
import { authGuard } from '../middleware/authGuard.js';
import { adminGuard } from '../middleware/adminGuard.js';
import { uploadSingle, uploadImages } from '../middleware/upload.js';
import {
  adminListProducts, createProduct, updateProduct, deleteProduct,
  addVariant, updateVariant, deleteVariant,
  addImage, deleteImage, setPrimaryImage,
  getProductVariants, getProductImages,
} from '../db/queries/products.js';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../db/queries/categories.js';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../db/queries/brands.js';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../db/queries/banners.js';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../db/queries/coupons.js';
import {
  adminListOrders, adminUpdateOrderStatus, adminGetDashboardStats,
} from '../db/queries/orders.js';
import { adminListUsers } from '../db/queries/users.js';
import { createNotification } from '../db/queries/notifications.js';

const router = Router();
router.use(authGuard, adminGuard);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', async (_req, res, next) => {
  try {
    const data = await adminGetDashboardStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', async (req, res, next) => {
  try {
    const rows = await adminListProducts(req.query);
    const total = rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0;
    res.json({ success: true, data: { products: rows, total } });
  } catch (err) { next(err); }
});

router.post('/products', uploadImages, async (req, res, next) => {
  try {
    const product = await createProduct(req.body);
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        await addImage(product.id, `/uploads/${req.files[i].filename}`, i === 0);
      }
    }
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
});

// Variants
router.get('/products/:id/variants', async (req, res, next) => {
  try {
    const data = await getProductVariants(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/products/:id/variants', async (req, res, next) => {
  try {
    const variant = await addVariant(req.params.id, req.body);
    res.status(201).json({ success: true, data: variant });
  } catch (err) { next(err); }
});

router.put('/products/variants/:id', async (req, res, next) => {
  try {
    const variant = await updateVariant(req.params.id, req.body);
    res.json({ success: true, data: variant });
  } catch (err) { next(err); }
});

router.delete('/products/variants/:id', async (req, res, next) => {
  try {
    await deleteVariant(req.params.id);
    res.json({ success: true, message: 'Variant deleted' });
  } catch (err) { next(err); }
});

// Images
router.get('/products/:id/images', async (req, res, next) => {
  try {
    const data = await getProductImages(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/products/:id/images', uploadImages, async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No images uploaded' });
    const existing = await getProductImages(req.params.id);
    const hasPrimary = existing.some(i => i.is_primary);
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const img = await addImage(req.params.id, `/uploads/${req.files[i].filename}`, !hasPrimary && i === 0);
      images.push(img);
    }
    res.status(201).json({ success: true, data: images });
  } catch (err) { next(err); }
});

router.delete('/products/images/:id', async (req, res, next) => {
  try {
    await deleteImage(req.params.id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) { next(err); }
});

router.put('/products/images/:id/primary', async (req, res, next) => {
  try {
    const { productId } = req.body;
    const img = await setPrimaryImage(req.params.id, productId);
    res.json({ success: true, data: img });
  } catch (err) { next(err); }
});

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories', async (_req, res, next) => {
  try {
    const data = await getAllCategories();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/categories', async (req, res, next) => {
  try {
    const data = await createCategory(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const data = await updateCategory(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
});

// ── Brands ────────────────────────────────────────────────────────────────────
router.get('/brands', async (_req, res, next) => {
  try {
    const data = await getBrands();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/brands', async (req, res, next) => {
  try {
    const data = await createBrand(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/brands/:id', async (req, res, next) => {
  try {
    const data = await updateBrand(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/brands/:id', async (req, res, next) => {
  try {
    await deleteBrand(req.params.id);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) { next(err); }
});

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res, next) => {
  try {
    const rows = await adminListOrders(req.query);
    const total = rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0;
    res.json({ success: true, data: { orders: rows, total } });
  } catch (err) { next(err); }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await adminUpdateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    createNotification(order.user_id, `Your order #ORD-${order.id} status has been updated to ${status}.`).catch(() => {});
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// ── Coupons ───────────────────────────────────────────────────────────────────
router.get('/coupons', async (_req, res, next) => {
  try {
    const data = await getAllCoupons();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/coupons', async (req, res, next) => {
  try {
    const data = await createCoupon(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/coupons/:id', async (req, res, next) => {
  try {
    const data = await updateCoupon(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/coupons/:id', async (req, res, next) => {
  try {
    await deleteCoupon(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
});

// ── Banners ───────────────────────────────────────────────────────────────────
router.get('/banners', async (_req, res, next) => {
  try {
    const data = await getAllBanners();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/banners', uploadSingle, async (req, res, next) => {
  try {
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
    const data = await createBanner({ ...req.body, image_url });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/banners/:id', uploadSingle, async (req, res, next) => {
  try {
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    const data = await updateBanner(req.params.id, { ...req.body, image_url });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/banners/:id', async (req, res, next) => {
  try {
    await deleteBanner(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) { next(err); }
});

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const rows = await adminListUsers(req.query);
    const total = rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0;
    res.json({ success: true, data: { users: rows, total } });
  } catch (err) { next(err); }
});

export default router;
