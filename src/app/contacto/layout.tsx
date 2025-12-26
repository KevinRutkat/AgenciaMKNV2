import type { Metadata } from "next";

const title = "Contacto Agencia MKN";
const description =
  "Contacta con Agencia MKN para comprar, vender o alquilar vivienda en Cabo de Palos, La Manga y Cartagena.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contacto" },
  openGraph: {
    title,
    description,
    url: "https://www.agenciamkn.com/contacto",
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

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
