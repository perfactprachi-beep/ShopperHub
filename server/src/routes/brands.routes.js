import { Router } from 'express';
import { listBrands, listProductsByBrand } from '../controllers/products.controller.js';

const router = Router();

router.get('/',               listBrands);
router.get('/:slug/products', listProductsByBrand);

export default router;
