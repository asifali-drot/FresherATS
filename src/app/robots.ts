import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/free-ats-resume-checker/editor',
        '/free-ats-resume-checker/result',
        '/history',
        '/studio',
      ],
    },
    // Replace with your actual domain when known
    sitemap: 'https://fresherats.com/sitemap.xml',
  };
}
