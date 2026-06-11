// Importamos el tipo NextConfig de Next.js para tipado TypeScript
import type { NextConfig } from "next";

// Configuración de Next.js - aquí definimos cómo se comporta nuestra aplicación
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1200, 1920],
    imageSizes: [48, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cbmcapwcbeeorpmlyqbe.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/maps/api/staticmap**',
      },
    ],
  },
};

// Exportamos la configuración para que Next.js la use
export default nextConfig;
