import { Router } from 'express';
import { listProducts, getProduct, searchProductsHandler } from '../controllers/products.controller.js';

const router = Router();

router.get('/',        listProducts);
router.get('/search',  searchProductsHandler);
router.get('/:slug',   getProduct);

export default router;
