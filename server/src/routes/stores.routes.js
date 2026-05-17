import { Router } from 'express';
import {
  getAllStores, getStoresNearPincode,
  checkStoreAvailability, checkExpressPincode,
} from '../db/queries/stores.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const stores = await getAllStores();
    res.json({ success: true, data: stores });
  } catch (err) { next(err); }
});

router.get('/near/:pincode', async (req, res, next) => {
  try {
    const stores = await getStoresNearPincode(req.params.pincode);
    res.json({ success: true, data: stores });
  } catch (err) { next(err); }
});

router.post('/check-pincode', async (req, res, next) => {
  try {
    const { pincode } = req.body;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode' });
    }
    const result = await checkExpressPincode(pincode);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/:storeId/availability', authGuard, async (req, res, next) => {
  try {
    const { variantIds } = req.body;
    if (!variantIds?.length) {
      return res.status(400).json({ success: false, message: 'variantIds required' });
    }
    const availability = await checkStoreAvailability(
      parseInt(req.params.storeId), variantIds
    );
    const allAvailable = availability.every(a => a.available);
    res.json({ success: true, data: { availability, allAvailable } });
  } catch (err) { next(err); }
});

export default router;
