import { NextResponse } from 'next/server';

export function middleware() {
  // Por ahora, simplemente permitir todas las rutas.
  // La verificación de autenticación se hace en las páginas individuales.
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/propiedades/add/:path*',
    '/propiedades/edit/:path*',
  ],
};
