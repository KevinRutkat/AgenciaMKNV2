import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://agenciamkn.com'
  
  // Páginas estáticas principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/propiedades`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // TODO: Aquí podrías agregar páginas dinámicas de propiedades
  // Por ejemplo, si tienes propiedades específicas:
  // const propiedadesDinamicas = await fetch('tu-api-de-propiedades')
  //   .then(res => res.json())
  //   .then(propiedades => propiedades.map(propiedad => ({
  //     url: `${baseUrl}/propiedades/${propiedad.id}`,
  //     lastModified: new Date(propiedad.updatedAt),
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.6,
  //   })))

  return [
    ...staticPages,
    // ...propiedadesDinamicas, // Descomenta cuando tengas propiedades dinámicas
  ]
}