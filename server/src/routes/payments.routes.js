import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { createOrder, verifyPayment, fetchOrder, createCodOrder, listPaymentMethods } from '../controllers/payments.controller.js';

const router = Router();

// Public — no auth needed
router.get('/methods', listPaymentMethods);

router.use(authGuard);
router.post('/create-order',     createOrder);
router.post('/create-cod-order', createCodOrder);
router.post('/verify',           verifyPayment);
router.get('/orders/:id',        fetchOrder);

export default router;
