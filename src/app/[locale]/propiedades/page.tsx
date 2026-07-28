import type { Metadata } from "next";
import PropiedadesPage from "@/app/propiedades/page";
import { getCanonicalPath, getLanguageAlternates, type SeoLocale } from "@/lib/i18n";

const metadataByLocale: Record<Exclude<SeoLocale, "es">, { title: string; description: string }> = {
  en: {
    title: "Properties in Cabo de Palos and La Manga",
    description:
      "Browse homes for sale in Cabo de Palos, La Manga and Cartagena with updated photos, prices and property details.",
  },
  de: {
    title: "Immobilien in Cabo de Palos und La Manga",
    description:
      "Entdecken Sie Immobilien zum Kauf in Cabo de Palos, La Manga und Cartagena mit aktuellen Fotos, Preisen und Details.",
  },
};

type Props = {
  params: Promise<{ locale: Exclude<SeoLocale, "es"> }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localized = metadataByLocale[locale];
  const canonical = getCanonicalPath("/propiedades", locale);

  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/propiedades"),
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      url: `https://www.agenciamkn.com${canonical}`,
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
      title: localized.title,
      description: localized.description,
      images: ["https://www.agenciamkn.com/LogoPNG.png"],
    },
  };
}

export default PropiedadesPage;
