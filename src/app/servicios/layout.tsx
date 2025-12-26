import type { Metadata } from "next";

const title = "Servicios inmobiliarios y traduccion profesional";
const description =
  "Servicios de gestion inmobiliaria, compraventa, alquiler y traduccion profesional en Cabo de Palos, La Manga y Cartagena.";

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
  return <>{children}</>;
}
