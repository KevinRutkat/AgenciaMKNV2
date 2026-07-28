import type { Metadata } from "next";
import ServiciosPage from "@/app/servicios/page";
import { getCanonicalPath, getLanguageAlternates, type SeoLocale } from "@/lib/i18n";

const metadataByLocale: Record<Exclude<SeoLocale, "es">, { title: string; description: string }> = {
  en: {
    title: "Real estate services and language support",
    description:
      "Home sales, property searches, administrative support and Spanish, German and English translation in Cabo de Palos, La Manga and Cartagena.",
  },
  de: {
    title: "Immobiliendienstleistungen und sprachliche Begleitung",
    description:
      "Verkauf von Wohnungen, Mietverwaltung fuer Eigentuemer, administrative Begleitung sowie Spanisch-, Deutsch- und Englisch-Uebersetzung in Cabo de Palos, La Manga und Cartagena.",
  },
};

type Props = {
  params: Promise<{ locale: Exclude<SeoLocale, "es"> }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localized = metadataByLocale[locale];
  const canonical = getCanonicalPath("/servicios", locale);

  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/servicios"),
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

export default ServiciosPage;
