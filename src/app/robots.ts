import { MetadataRoute } from "next";

const baseUrl = "https://www.agenciamkn.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/test-translation/",
          "/translation-example/",
          "/session/",
          "/propiedades/add",
          "/propiedades/edit"
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}