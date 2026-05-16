import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { validate, getActiveCoupons } from '../controllers/coupons.controller.js';

const router = Router();

// Public — no auth needed
router.get('/active', getActiveCoupons);

// Auth-protected
router.use(authGuard);
router.post('/validate', validate);

export default router;
