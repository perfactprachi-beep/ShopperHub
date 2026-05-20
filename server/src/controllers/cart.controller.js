import {
  getCartByUser,
  addOrUpdateItem,
  updateItemQty,
  removeItem,
  clearCart,
  mergeCarts,
} from '../db/queries/cart.js';
import { pool } from '../db/pool.js';

function buildResponse(items) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.lineTotal), 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, subtotal: Math.round(subtotal * 100) / 100, itemCount };
}

export async function getCart(req, res, next) {
  try {
    const items = await getCartByUser(req.user.id);
    res.json({ success: true, data: buildResponse(items) });
  } catch (err) { next(err); }
}

export async function addItem(req, res, next) {
  try {
    let { variantId, productId, quantity = 1 } = req.body;

    if (!variantId && !productId) {
      return res.status(400).json({ success: false, message: 'variantId or productId required' });
    }

    // Product has no variants — find or create a default variant
    if (!variantId && productId) {
      const existing = await pool.query(
        `SELECT id, stock FROM product_variants WHERE product_id = $1 AND size IS NULL AND color IS NULL LIMIT 1`,
        [productId]
      );
      if (existing.rows.length > 0) {
        variantId = existing.rows[0].id;
      } else {
        const prod = await pool.query('SELECT stock FROM products WHERE id = $1', [productId]);
        if (!prod.rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });
        const created = await pool.query(
          `INSERT INTO product_variants (product_id, stock, extra_price) VALUES ($1, $2, 0) RETURNING id`,
          [productId, prod.rows[0].stock]
        );
        variantId = created.rows[0].id;
      }
    }

    const { rows } = await pool.query(
      'SELECT stock FROM product_variants WHERE id = $1',
      [variantId]
    );
    const available = rows[0]?.stock ?? 0;
    if (available <= 0) {
      return res.status(409).json({ success: false, message: 'This item is out of stock' });
    }

    await addOrUpdateItem(req.user.id, variantId, quantity);
    const items = await getCartByUser(req.user.id);
    res.json({ success: true, data: buildResponse(items), message: 'Item added to cart' });
  } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'quantity must be >= 1' });
    const updated = await updateItemQty(req.params.itemId, req.user.id, quantity);
    if (!updated) return res.status(404).json({ success: false, message: 'Cart item not found' });
    const items = await getCartByUser(req.user.id);
    res.json({ success: true, data: buildResponse(items) });
  } catch (err) { next(err); }
}

export async function deleteItem(req, res, next) {
  try {
    await removeItem(req.params.itemId, req.user.id);
    const items = await getCartByUser(req.user.id);
    res.json({ success: true, data: buildResponse(items), message: 'Item removed' });
  } catch (err) { next(err); }
}

export async function mergeCart(req, res, next) {
  try {
    const { items: guestItems } = req.body;
    if (Array.isArray(guestItems) && guestItems.length > 0) {
      await mergeCarts(req.user.id, guestItems);
    }
    const items = await getCartByUser(req.user.id);
    res.json({ success: true, data: buildResponse(items), message: 'Cart merged' });
  } catch (err) { next(err); }
}
