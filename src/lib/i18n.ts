export const BASE_URL = "https://www.agenciamkn.com";

export const DEFAULT_LOCALE = "es";

export const SEO_LOCALES = ["es", "en", "de"] as const;

export type SeoLocale = (typeof SEO_LOCALES)[number];

export const LOCALE_NAMES: Record<SeoLocale, string> = {
  es: "Español",
  en: "English",
  de: "Deutsch",
};

export function isSeoLocale(value: string): value is SeoLocale {
  return SEO_LOCALES.includes(value as SeoLocale);
}

export function stripLocaleFromPath(pathname: string) {
  const normalized = pathname || "/";
  const segments = normalized.split("/");
  const maybeLocale = segments[1];

  if (maybeLocale && isSeoLocale(maybeLocale)) {
    const stripped = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
    return stripped || "/";
  }

  return normalized;
}

export function getLocaleFromPath(pathname: string): SeoLocale {
  const maybeLocale = pathname.split("/")[1];
  return maybeLocale && isSeoLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

export function getLocalizedPath(pathname: string, locale: string) {
  const pathWithoutLocale = stripLocaleFromPath(pathname);

  if (!isSeoLocale(locale) || locale === DEFAULT_LOCALE) {
    return pathWithoutLocale;
  }

  return pathWithoutLocale === "/"
    ? `/${locale}`
    : `/${locale}${pathWithoutLocale}`;
}

export function getLanguageAlternates(pathname: string) {
  const pathWithoutLocale = stripLocaleFromPath(pathname);
  const languages: Record<string, string> = {
    "es-ES": `${BASE_URL}${getLocalizedPath(pathWithoutLocale, "es")}`,
    "en-GB": `${BASE_URL}${getLocalizedPath(pathWithoutLocale, "en")}`,
    "de-DE": `${BASE_URL}${getLocalizedPath(pathWithoutLocale, "de")}`,
    "x-default": `${BASE_URL}${getLocalizedPath(pathWithoutLocale, "es")}`,
  };

  return languages;
}

export function getCanonicalPath(pathname: string, locale: SeoLocale = DEFAULT_LOCALE) {
  return getLocalizedPath(stripLocaleFromPath(pathname), locale);
}
