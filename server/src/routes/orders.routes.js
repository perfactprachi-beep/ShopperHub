import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { listOrders, fetchOrder, cancel } from '../controllers/orders.controller.js';

const router = Router();
router.use(authGuard);

router.get('/',         listOrders);
router.get('/:id',      fetchOrder);
router.post('/:id/cancel', cancel);

export default router;
