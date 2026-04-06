import type { Metadata } from "next";

const title = "Servicios inmobiliarios y acompañamiento lingüístico";
const description =
  "Servicios de venta de viviendas, gestión de alquileres para propietarios y traducción e interpretación cercana en Cabo de Palos, La Manga y Cartagena.";

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Servicios de Agencia MKN",
  serviceType: "Inmobiliaria y acompañamiento lingüístico",
  provider: {
    "@type": "RealEstateAgent",
    name: "Agencia MKN",
    url: "https://www.agenciamkn.com",
  },
  areaServed: [
    "Cabo de Palos",
    "La Manga del Mar Menor",
    "Cartagena",
    "Alicante",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Compra y venta de viviendas, terrenos y garajes",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Gestión de alquileres para propietarios",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Acompañamiento documental en compraventas y alquileres",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Traducción e interpretación en español, alemán e inglés",
        },
      },
    ],
  },
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/servicios" },
  openGraph: {
    title,
    description,
    url: "https://www.agenciamkn.com/servicios",
    siteName: "Agencia MKN",
    type: "website",
    images: [
      {
        url: "https://www.agenciamkn.com/LogoPNG.png",
        width: 1200,
        height: 630,
        alt: "Agencia MKN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://www.agenciamkn.com/LogoPNG.png"],
  },
};

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
    </>
  );
}
