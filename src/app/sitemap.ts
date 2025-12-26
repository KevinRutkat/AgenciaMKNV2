import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const baseUrl = "https://www.agenciamkn.com";

const toLastModified = (dateValue?: string) => {
  if (!dateValue) return new Date();
  const parsed = Date.parse(dateValue);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/propiedades`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("viviendas")
      .select("id, inserted_at");

    if (error || !data) {
      return staticRoutes;
    }

    const listingRoutes: MetadataRoute.Sitemap = data.map((vivienda) => ({
      url: `${baseUrl}/propiedades/${vivienda.id}`,
      lastModified: toLastModified(vivienda.inserted_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
