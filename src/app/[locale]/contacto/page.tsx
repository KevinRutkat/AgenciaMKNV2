import type { Metadata } from "next";
import ContactoPage from "@/app/contacto/page";
import { getCanonicalPath, getLanguageAlternates, type SeoLocale } from "@/lib/i18n";

const metadataByLocale: Record<Exclude<SeoLocale, "es">, { title: string; description: string }> = {
  en: {
    title: "Contact Agencia MKN",
    description:
      "Contact Agencia MKN to sell a property, manage a rental or receive Spanish, German and English translation support in Cabo de Palos, La Manga and Cartagena.",
  },
  de: {
    title: "Kontakt Agencia MKN",
    description:
      "Kontaktieren Sie Agencia MKN fuer Immobilienverkauf, Mietverwaltung oder sprachliche Begleitung auf Spanisch, Deutsch und Englisch in Cabo de Palos, La Manga und Cartagena.",
  },
};

type Props = {
  params: Promise<{ locale: Exclude<SeoLocale, "es"> }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localized = metadataByLocale[locale];
  const canonical = getCanonicalPath("/contacto", locale);

  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/contacto"),
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

export default ContactoPage;
