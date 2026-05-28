export const API_CANDIDATES = [
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_API_FALLBACK_URL,
  '/api',
  'http://localhost:3005',
].filter(Boolean) as string[];

export const API_BASE_URL = API_CANDIDATES[0] ?? 'http://localhost:3005';

export const STORAGE_KEYS = {
  session: 'univalle-shop-session',
  theme: 'univalle-shop-theme',
};
