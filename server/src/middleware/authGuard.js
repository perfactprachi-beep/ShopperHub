import { verifyAccessToken } from '../services/auth.service.js';

export function authGuard(req, res, next) {
  const header = req.headers.authorization;
  console.log('[authGuard] Authorization header:', header ? 'Present' : 'Missing');
  
  if (!header?.startsWith('Bearer ')) {
    console.log('[authGuard] Invalid token format or missing');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const token = header.slice(7);
    req.user = verifyAccessToken(token);
    console.log('[authGuard] Token verified for user:', req.user.id);
    next();
  } catch (err) {
    console.error('[authGuard] Token verification failed:', err.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
