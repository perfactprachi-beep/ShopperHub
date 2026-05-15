import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { listAddresses, createAddress, editAddress, removeAddress, makeDefault } from '../controllers/account.controller.js';

const router = Router();
router.use(authGuard);

router.get('/addresses',             listAddresses);
router.post('/addresses',            createAddress);
router.put('/addresses/:id',         editAddress);
router.delete('/addresses/:id',      removeAddress);
router.put('/addresses/:id/default', makeDefault);

export default router;
