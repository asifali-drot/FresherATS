import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/analyze/editor',
        '/analyze/result',
        '/history',
        '/studio',
      ],
    },
    // Replace with your actual domain when known
    sitemap: 'https://fresherats.com/sitemap.xml',
  };
}
