import { Router } from 'express';
import { getPageBySlug } from '../db/queries/pages.js';

const router = Router();

router.get('/:slug', async (req, res, next) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page || page.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (err) { next(err); }
});

export default router;
