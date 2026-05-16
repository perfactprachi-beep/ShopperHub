import { Router } from 'express';
import { getActiveOffers } from '../db/queries/offers.js';

const router = Router();

router.get('/active', async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const data = await getActiveOffers(categoryId || null);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
