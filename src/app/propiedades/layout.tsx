import type { Metadata } from "next";

const title = "Propiedades en Cabo de Palos y La Manga";
const description =
  "Explora viviendas en venta y alquiler en Cabo de Palos, La Manga y Cartagena con fotos, precios y detalles actualizados.";

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  url: "https://www.agenciamkn.com/propiedades",
  about: {
    "@type": "RealEstateAgent",
    name: "Agencia MKN",
    url: "https://www.agenciamkn.com",
  },
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/propiedades" },
  openGraph: {
    title,
    description,
    url: "https://www.agenciamkn.com/propiedades",
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

export default function PropiedadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}
