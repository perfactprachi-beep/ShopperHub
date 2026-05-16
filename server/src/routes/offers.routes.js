import { Router } from 'express';
import { getActiveOffers } from '../db/queries/offers.js';

const router = Router();

router.get('/active', async (_req, res, next) => {
  try {
    const data = await getActiveOffers();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
