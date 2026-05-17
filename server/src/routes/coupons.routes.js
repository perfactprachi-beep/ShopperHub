import { Router } from 'express';
import { validate, getActiveCoupons } from '../controllers/coupons.controller.js';

const router = Router();

// Public — no auth needed
router.get('/active', getActiveCoupons);
router.post('/validate', validate);

export default router;
