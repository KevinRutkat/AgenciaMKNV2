import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://agenciamkn.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/logo.png',
          '/LogoPNG.png',
          '/favicon.ico',
          '/*.png',
          '/*.jpg',
          '/*.jpeg',
          '/*.webp',
          '/*.svg',
        ],
        disallow: [
          '/api/',
          '/session/',
          '/test-translation/',
          '/translation-example/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}