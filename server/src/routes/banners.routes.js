import { Router } from 'express';
import { getActiveBanners, getActiveBannersByPosition } from '../db/queries/banners.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const banners = await getActiveBanners();
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

router.get('/:position', async (req, res, next) => {
  try {
    const data = await getActiveBannersByPosition(req.params.position);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
