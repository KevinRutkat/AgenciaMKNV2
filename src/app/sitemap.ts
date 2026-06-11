import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { BASE_URL, SEO_LOCALES, getLanguageAlternates, getLocalizedPath } from "@/lib/i18n";

const toLastModified = (dateValue?: string) => {
  if (!dateValue) return new Date();
  const parsed = Date.parse(dateValue);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
};

const localizedEntries = ({
  path,
  lastModified,
  changeFrequency,
  priority,
}: {
  path: string;
  lastModified: Date;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}): MetadataRoute.Sitemap =>
  SEO_LOCALES.map((locale) => {
    const localizedPath = getLocalizedPath(path, locale);

    return {
      url: `${BASE_URL}${localizedPath}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: getLanguageAlternates(path),
      },
    };
  });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries({
      path: "/",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    }),
    ...localizedEntries({
      path: "/propiedades",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    }),
    ...localizedEntries({
      path: "/servicios",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...localizedEntries({
      path: "/contacto",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  ];

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("viviendas")
      .select("id, inserted_at");

    if (error || !data) {
      return staticRoutes;
    }

    const listingRoutes: MetadataRoute.Sitemap = data.flatMap((vivienda) =>
      localizedEntries({
        path: `/propiedades/${vivienda.id}`,
        lastModified: toLastModified(vivienda.inserted_at),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
