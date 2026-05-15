import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { listReviews, createReview, checkPurchased } from '../controllers/reviews.controller.js';

const router = Router();

router.get('/:productId',           listReviews);
router.get('/:productId/purchased', authGuard, checkPurchased);
router.post('/',                    authGuard, createReview);

export default router;
