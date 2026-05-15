import { getReviews, getAverageRating, addReview } from '../db/queries/reviews.js';
import { hasPurchasedProduct } from '../db/queries/orders.js';

export async function listReviews(req, res, next) {
  try {
    const [reviews, stats] = await Promise.all([
      getReviews(req.params.productId),
      getAverageRating(req.params.productId),
    ]);
    res.json({ success: true, data: { reviews, stats } });
  } catch (err) { next(err); }
}

export async function createReview(req, res, next) {
  try {
    const { productId, rating, body } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'productId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const review = await addReview(req.user.id, productId, { rating, body });
    res.status(201).json({ success: true, data: review, message: 'Review submitted' });
  } catch (err) { next(err); }
}

export async function checkPurchased(req, res, next) {
  try {
    const purchased = await hasPurchasedProduct(req.user.id, req.params.productId);
    res.json({ success: true, data: { purchased } });
  } catch (err) { next(err); }
}
