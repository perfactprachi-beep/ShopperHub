import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { listNotifications, markRead } from '../controllers/notifications.controller.js';

const router = Router();
router.use(authGuard);

router.get('/',    listNotifications);
router.put('/read', markRead);

export default router;
