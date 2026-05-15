import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { createOrder, verifyPayment, fetchOrder } from '../controllers/payments.controller.js';

const router = Router();
router.use(authGuard);

router.post('/create-order', createOrder);
router.post('/verify',       verifyPayment);
router.get('/orders/:id',    fetchOrder);

export default router;
