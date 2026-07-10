import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/unauthorized/', '/login/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
