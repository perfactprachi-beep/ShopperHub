import {
  getWishlistByUser,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from '../db/queries/wishlist.js';

export async function listWishlist(req, res, next) {
  try {
    const items = await getWishlistByUser(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });
    const already = await isInWishlist(req.user.id, productId);
    if (already) {
      await removeFromWishlist(req.user.id, productId);
      res.json({ success: true, data: { added: false }, message: 'Removed from wishlist' });
    } else {
      await addToWishlist(req.user.id, productId);
      res.json({ success: true, data: { added: true }, message: 'Added to wishlist' });
    }
  } catch (err) { next(err); }
}

export async function deleteWishlistItem(req, res, next) {
  try {
    await removeFromWishlist(req.user.id, req.params.productId);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { next(err); }
}
