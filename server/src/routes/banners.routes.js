import { Router } from 'express';
import { getActiveBanners } from '../db/queries/banners.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const banners = await getActiveBanners();
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

export default router;
