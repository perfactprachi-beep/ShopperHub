const SERVER = import.meta.env.VITE_API_BASE.replace('/api', '');

export function assetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER}${path}`;
}
