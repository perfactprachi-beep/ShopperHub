import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { listWishlist, toggleWishlist, deleteWishlistItem } from '../controllers/wishlist.controller.js';

const router = Router();

router.use(authGuard);

router.get('/',                    listWishlist);
router.post('/',                   toggleWishlist);
router.delete('/:productId',       deleteWishlistItem);

export default router;
