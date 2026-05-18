export function adminGuard(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

export function blockAdmin(req, res, next) {
  if (req.user?.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Not available for admin accounts' });
  }
  next();
}
