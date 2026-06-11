import type { Metadata } from "next";
import ViviendaDetailPage, {
  generateMetadata as generatePropertyMetadata,
} from "@/app/propiedades/[id]/page";
import { getCanonicalPath, getLanguageAlternates, type SeoLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{ locale: Exclude<SeoLocale, "es">; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const metadata = await generatePropertyMetadata({
    params: Promise.resolve({ id }),
  });
  const path = `/propiedades/${id}`;
  const canonical = getCanonicalPath(path, locale);

  return {
    ...metadata,
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
    openGraph: metadata.openGraph
      ? {
          ...metadata.openGraph,
          url: `https://www.agenciamkn.com${canonical}`,
        }
      : undefined,
  };
}

export default async function LocalizedViviendaDetailPage({ params }: Props) {
  const { id } = await params;

  return <ViviendaDetailPage params={Promise.resolve({ id })} />;
}
