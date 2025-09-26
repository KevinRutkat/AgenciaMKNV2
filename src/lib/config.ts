export const imagesBucketName =
  process.env.SUPABASE_IMAGES_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET ||
  'propiedades-images';

export const imagesBucketPrefix =
  (process.env.SUPABASE_IMAGES_PREFIX || '').replace(/^\/+|\/+$|\s+$/g, ''); // e.g., 'viviendas'

// Configuración de sesión - 12 horas
export const SESSION_DURATION = {
  ACCESS_TOKEN_HOURS: 12,
  ACCESS_TOKEN_SECONDS: 12 * 60 * 60, // 43200 segundos
  REFRESH_TOKEN_DAYS: 7,
  REFRESH_TOKEN_SECONDS: 7 * 24 * 60 * 60 // 604800 segundos
};

// Para usar en el cliente de Supabase si es necesario
export const AUTH_CONFIG = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
};
