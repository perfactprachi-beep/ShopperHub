import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { getCart, addItem, updateItem, deleteItem, mergeCart } from '../controllers/cart.controller.js';

const router = Router();

router.use(authGuard);

router.get('/',            getCart);
router.post('/',           addItem);
router.put('/:itemId',     updateItem);
router.delete('/:itemId',  deleteItem);
router.post('/merge',      mergeCart);

export default router;
