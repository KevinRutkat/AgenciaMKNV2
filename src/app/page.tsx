import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

const title = "Agencia MKN - Inmobiliaria y traduccion";
const description =
  "Compra, venta y alquiler de viviendas, garajes y terrenos en Cabo de Palos, La Manga y Cartagena. Servicios de traduccion y asesoria en contratos.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "https://www.agenciamkn.com/",
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

export default function Home() {
  return <HomePageClient />;
}
