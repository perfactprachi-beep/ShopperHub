export function assetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // /uploads/... is proxied by Vite in dev and served directly in prod
  return path.startsWith('/') ? path : `/${path}`;
}
