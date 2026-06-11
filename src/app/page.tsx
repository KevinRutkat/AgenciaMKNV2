import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { getLanguageAlternates } from "@/lib/i18n";

const title = "Agencia MKN - Gestión de viviendas, acompañamiento y traducción";
const description =
  "Agencia de gestión integral en Cabo de Palos y la Costa Cálida: compraventa de viviendas, búsqueda de propiedades, acompañamiento a clientes extranjeros, gestiones administrativas (NIE, notaría, ayuntamiento) y traducción e interpretación en español, alemán e inglés.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
    languages: getLanguageAlternates("/"),
  },
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
