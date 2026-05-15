import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../controllers/coupons.controller.js';

const router = Router();
router.use(authGuard);

router.post('/validate', validate);

export default router;
