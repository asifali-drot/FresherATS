import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/editor',
        '/result',
        '/history',
        '/studio',
      ],
    },
    sitemap: 'https://fresherats.com/sitemap.xml',
  };
}
