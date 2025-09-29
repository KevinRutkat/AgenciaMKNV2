// Importamos el tipo Metadata de Next.js para definir metadatos SEO
import type { Metadata } from "next";
// Importamos la fuente Inter de Google Fonts
import { Inter } from "next/font/google";
// Importamos el componente Header personalizado
import Header from "@/components/Header";
// Importamos el componente Footer personalizado
import Footer from "@/components/Footer";
// Importamos el indicador de carga de traducciones
import TranslationLoadingIndicator from "@/components/TranslationLoadingIndicator";
import FloatingLanguageSelector from "@/components/FloatingLanguageSelector";
// Importamos el AuthProvider para manejar autenticación
import { AuthProvider } from "@/contexts/AuthContext";
// Importamos el LanguageProvider para manejar traducciones
import { LanguageProvider } from "@/contexts/LanguageContext";
// Importamos el GoogleMapsProvider para manejar la API de Google Maps
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
// Importamos los estilos globales CSS
import "./globals.css";

// Configuramos la fuente Inter con opciones específicas
const inter = Inter({
  subsets: ["latin"], // Solo caracteres latinos para reducir el tamaño
  display: "swap",    // Optimización para carga de fuentes
});

// Definimos los metadatos que aparecerán en el <head> de todas las páginas
export const metadata: Metadata = {
  metadataBase: new URL('https://agenciamkn.com'),
  title: "Agencia MKN - Inmobiliaria y Traductora",
    description: "Especialistas en inmuebles, gestión de propiedades y traducción presencial y virtual. Tus socios de confianza para gestionar su inmueble y para ofrecer servicios de traducción de todo tipo.",
  keywords: ["agencia", "inmobiliaria", "propiedades", "inmobiliaria", "traductora"],
  authors: [{ name: "Agencia MKN" }],
  creator: "Agencia MKN",
  publisher: "Agencia MKN",
  
  // Configuración de iconos
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/LogoPNG.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  
  // Open Graph para redes sociales y búsquedas
  openGraph: {
    title: "Agencia MKN - Inmobiliaria y Traductora",
    description: "Especialistas en inmuebles, gestión de propiedades y traducción presencial y virtual. Tus socios de confianza para gestionar su inmueble y para ofrecer servicios de traducción de todo tipo.",
    url: "https://agenciamkn.com",
    siteName: "Agencia MKN",
    images: [
      {
        url: "/LogoPNG.png",
        width: 1200,
        height: 630,
        alt: "Agencia MKN Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  
  
  // Configuración adicional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Manifest para PWA
  manifest: "/manifest.json",
};

// Componente Layout principal que envuelve toda la aplicación
// Recibe 'children' que representa el contenido de cada página
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Tipo TypeScript para elementos React
}>) {
  return (
    // Elemento HTML raíz con idioma español
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <GoogleMapsProvider>
              {/* Indicador de carga de traducciones */}
              <TranslationLoadingIndicator />
              
              {/* Header que aparecerá en todas las páginas */}
              <Header />

              {/* 
              Aplicamos la clase de la fuente Inter y antialiased para texto suave
              {children} renderiza el contenido específico de cada página 
              */}
              {children}

              {/* Selector de idioma flotante bottom-left */}
              <FloatingLanguageSelector position="bottom-left" />

              {/* Footer traducible */}
              <Footer />
            </GoogleMapsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
