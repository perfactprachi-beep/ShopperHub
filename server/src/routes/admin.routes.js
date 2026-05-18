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
  getProductAttributes, addProductAttribute, updateProductAttribute, deleteProductAttribute,
} from '../db/queries/products.js';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../db/queries/categories.js';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../db/queries/brands.js';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../db/queries/banners.js';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../db/queries/coupons.js';
import { getAllOffers, createOffer, updateOffer, deleteOffer } from '../db/queries/offers.js';
import {
  adminListOrders, adminUpdateOrderStatus, adminGetDashboardStats,
} from '../db/queries/orders.js';
import {
  updatePickupStatus,
  adminListStores, adminToggleStore, adminAddStore, adminUpdateStore, adminDeleteStore,
  adminListPincodes, adminAddPincode, adminUpdatePincode, adminDeletePincode,
} from '../db/queries/stores.js';
import { adminListUsers, adminUpdateUserStatus, adminDeleteUser } from '../db/queries/users.js';
import { createNotification } from '../db/queries/notifications.js';
import {
  adminListPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
} from '../db/queries/paymentMethods.js';

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

// ── Product Attributes ────────────────────────────────────────────────────────
router.get('/products/:id/attributes', async (req, res, next) => {
  try {
    const data = await getProductAttributes(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/products/:id/attributes', async (req, res, next) => {
  try {
    const data = await addProductAttribute(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/products/attributes/:id', async (req, res, next) => {
  try {
    const data = await updateProductAttribute(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/products/attributes/:id', async (req, res, next) => {
  try {
    await deleteProductAttribute(req.params.id);
    res.json({ success: true, message: 'Attribute deleted' });
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

router.post('/brands', uploadSingle, async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.logo_url = `/uploads/${req.file.filename}`;
    const data = await createBrand(body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/brands/:id', uploadSingle, async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.logo_url = `/uploads/${req.file.filename}`;
    const data = await updateBrand(req.params.id, body);
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

router.put('/orders/:id/pickup-status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'ready', 'collected', 'expired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid pickup status' });
    }
    await updatePickupStatus(req.params.id, status);
    res.json({ success: true, message: `Pickup status updated to ${status}` });
  } catch (err) { next(err); }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await adminUpdateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const msgs = {
      confirmed: `Your order #ORD-${order.id} has been confirmed and is being prepared.`,
      shipped:   `Great news! Your order #ORD-${order.id} has been shipped and is on its way.`,
      delivered: `Your order #ORD-${order.id} has been delivered. Enjoy your purchase!`,
    };
    createNotification(order.user_id, msgs[status] ?? `Your order #ORD-${order.id} has been updated to ${status}.`).catch(() => {});
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

// ── Offers ────────────────────────────────────────────────────────────────────
router.get('/offers', async (_req, res, next) => {
  try {
    const data = await getAllOffers();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/offers', async (req, res, next) => {
  try {
    const data = await createOffer(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/offers/:id', async (req, res, next) => {
  try {
    const data = await updateOffer(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/offers/:id', async (req, res, next) => {
  try {
    await deleteOffer(req.params.id);
    res.json({ success: true, message: 'Offer deleted' });
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

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be a boolean' });
    }
    const user = await adminUpdateUserStatus(req.params.id, is_active);
    if (!user) return res.status(404).json({ success: false, message: 'User not found or cannot modify admin accounts' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await adminDeleteUser(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found or cannot delete admin accounts' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

// ── Payment Methods ───────────────────────────────────────────────────────────
router.get('/payment-methods', async (_req, res, next) => {
  try {
    const data = await adminListPaymentMethods();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/payment-methods', async (req, res, next) => {
  try {
    const data = await createPaymentMethod(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/payment-methods/:id', async (req, res, next) => {
  try {
    const data = await updatePaymentMethod(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Payment method not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/payment-methods/:id', async (req, res, next) => {
  try {
    await deletePaymentMethod(req.params.id);
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (err) { next(err); }
});

// ── Delivery: store management ────────────────────────────────────────────────

router.get('/delivery/stores', async (_req, res, next) => {
  try {
    const data = await adminListStores();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/delivery/stores', async (req, res, next) => {
  try {
    const { name, city, state, address, pincode } = req.body;
    if (!name?.trim() || !city?.trim() || !state?.trim() || !address?.trim() || !pincode?.trim()) {
      return res.status(400).json({ success: false, message: 'name, city, state, address, pincode are required' });
    }
    const data = await adminAddStore(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/delivery/stores/:id', async (req, res, next) => {
  try {
    const data = await adminUpdateStore(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/delivery/stores/:id', async (req, res, next) => {
  try {
    await adminDeleteStore(req.params.id);
    res.json({ success: true, message: 'Store removed' });
  } catch (err) { next(err); }
});

// ── Delivery: express pincode management ──────────────────────────────────────

router.get('/delivery/pincodes', async (_req, res, next) => {
  try {
    const data = await adminListPincodes();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/delivery/pincodes', async (req, res, next) => {
  try {
    const { pincode, city, is_express, delivery_hrs } = req.body;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode' });
    }
    if (!city?.trim()) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }
    const data = await adminAddPincode({ pincode, city: city.trim(), is_express, delivery_hrs });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/delivery/pincodes/:pincode', async (req, res, next) => {
  try {
    const { city, is_express, delivery_hrs } = req.body;
    const data = await adminUpdatePincode(req.params.pincode, { city, is_express, delivery_hrs });
    if (!data) return res.status(404).json({ success: false, message: 'Pincode not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/delivery/pincodes/:pincode', async (req, res, next) => {
  try {
    await adminDeletePincode(req.params.pincode);
    res.json({ success: true, message: 'Pincode removed' });
  } catch (err) { next(err); }
});

export default router;
