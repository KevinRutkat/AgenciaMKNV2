import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { getCanonicalPath, getLanguageAlternates, type SeoLocale } from "@/lib/i18n";

const metadataByLocale: Record<Exclude<SeoLocale, "es">, { title: string; description: string }> = {
  en: {
    title: "Agencia MKN - Property management, support and translation",
    description:
      "Property management agency in Cabo de Palos and Costa Calida: home sales, property search, support for foreign clients, administrative procedures and Spanish, German and English translation.",
  },
  de: {
    title: "Agencia MKN - Immobilienservice, Begleitung und Uebersetzung",
    description:
      "Agentur fuer Immobilienbetreuung in Cabo de Palos und an der Costa Calida: Verkauf, Immobiliensuche, Begleitung auslaendischer Kunden, Behoerdengaenge sowie Spanisch-, Deutsch- und Englisch-Uebersetzung.",
  },
};

type Props = {
  params: Promise<{ locale: Exclude<SeoLocale, "es"> }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localized = metadataByLocale[locale];
  const canonical = getCanonicalPath("/", locale);

  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/"),
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

export default function LocalizedHome() {
  return <HomePageClient />;
}
