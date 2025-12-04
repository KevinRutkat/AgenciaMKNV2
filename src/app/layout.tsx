// Importamos el tipo Metadata de Next.js para definir metadatos SEO
import type { Metadata } from "next";
// Importamos la fuente Inter de Google Fonts
import { Inter } from "next/font/google";
// Importamos el componente Header personalizado
import Header from "@/components/Header";
// Importamos el componente Footer personalizado
import Footer from "@/components/Footer";
// Indicador de carga de traducciones
import TranslationLoadingIndicator from "@/components/TranslationLoadingIndicator";
import FloatingLanguageSelector from "@/components/FloatingLanguageSelector";
// Providers globales
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
// Estilos globales
import "./globals.css";

// Configuración de la fuente Inter
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// JSON-LD para estructura WebSite
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Agencia MKN",
  alternateName: "Agencia MKN Inmobiliaria y Traductora",
  url: "https://agenciamkn.com",
};

// JSON-LD para negocio local / agencia inmobiliaria
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Agencia MKN",
  image: "https://agenciamkn.com/LogoPNG.png",
  url: "https://agenciamkn.com",
  telephone: "+34 634 73 79 49",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ctra. a Cabo de Palos, Km. 25",
    addressLocality: "Cabo de Palos",
    addressRegion: "Murcia",
    postalCode: "30370",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.627368,
    longitude: -0.710618,
  },
  areaServed: [
    "Cabo de Palos",
    "La Manga del Mar Menor",
    "Cartagena",
    "Alicante",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "11:00",
      closes: "14:00",
    },
  ],
};

// Metadatos globales
export const metadata: Metadata = {
  metadataBase: new URL("https://agenciamkn.com"),
  alternates: {
    canonical: "/", 
  },
  title: {
    default: "Agencia MKN - Inmobiliaria y Traductora",
    template: "%s | Agencia MKN",
  },
  description:
    "Especialistas en inmuebles, gestión de propiedades y traducción profesional. Agencia MKN: tu inmobiliaria y traductora de confianza en Cabo de Palos, Cartagena y La Manga.",
  keywords: [
    "agencia inmobiliaria",
    "inmobiliaria cabo de palos",
    "la manga",
    "cartagena",
    "servicios de traducción",
    "gestión de propiedades",
    "agencia mkn",
  ],
  authors: [{ name: "Agencia MKN" }],
  creator: "Agencia MKN",
  publisher: "Agencia MKN",

  // Iconos
  icons: {
    icon: [
      { url: "/LogoPNG.png", sizes: "32x32", type: "image/png" },
      { url: "/LogoPNG.png", sizes: "192x192", type: "image/png" },
      { url: "/LogoPNG.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/LogoPNG.png", sizes: "180x180", type: "image/png" }],
  },

  // Open Graph
  openGraph: {
    title: "Agencia MKN - Inmobiliaria y Traductora",
    description:
      "Gestión de inmuebles, compraventa, alquiler y traducción profesional en Cabo de Palos, Cartagena y La Manga.",
    url: "https://agenciamkn.com",
    siteName: "Agencia MKN",
    images: [
      {
        url: "https://agenciamkn.com/LogoPNG.png",
        width: 1200,
        height: 630,
        alt: "Agencia MKN Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  manifest: "/manifest.json",
};

// Layout principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Schema.org WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Schema.org RealEstateAgent + LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <GoogleMapsProvider>
              <TranslationLoadingIndicator />
              <Header />
              {children}
              <FloatingLanguageSelector position="bottom-left" />
              <Footer />
            </GoogleMapsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
