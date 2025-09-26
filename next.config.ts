// Importamos el tipo NextConfig de Next.js para tipado TypeScript
import type { NextConfig } from "next";

// Configuración de Next.js - aquí definimos cómo se comporta nuestra aplicación
const nextConfig: NextConfig = {
  images: {
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
