import { notFound } from "next/navigation";
import { isSeoLocale, type SeoLocale } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "de" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSeoLocale(locale) || locale === "es") {
    notFound();
  }

  return children;
}

export type LocaleParams = Promise<{ locale: SeoLocale }>;
