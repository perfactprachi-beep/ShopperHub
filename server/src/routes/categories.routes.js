import { Router } from 'express';
import { listCategories, listProductsByCategory } from '../controllers/products.controller.js';

const router = Router();

router.get('/',          listCategories);
router.get('/:slug/products', listProductsByCategory);

export default router;
