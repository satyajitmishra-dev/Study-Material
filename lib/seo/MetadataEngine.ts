import { Metadata } from 'next';

interface MetadataInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export const METADATA_DEFAULTS = {
  title: 'StudyMaterial — The Future of Learning for Developers',
  description: 'An immersive desktop-grade workspace engineered for developers to master modern frontend, backend, and AI stacks.',
  url: 'https://studymaterial.utool.in',
  defaultImage: '/og-default.png',
  twitterHandle: '@studymaterial'
};

export function getMetadata(input: MetadataInput = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || METADATA_DEFAULTS.url;
  const path = input.path || '';
  const canonicalUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  const title = input.title
    ? `${input.title} | StudyMaterial`
    : METADATA_DEFAULTS.title;
  const description = input.description || METADATA_DEFAULTS.description;

  // Compile Dynamic OG Image URL (calling our dynamic OG generator /api/og)
  let ogImageUrl = input.image;
  if (!ogImageUrl) {
    const params = new URLSearchParams();
    params.set('title', input.title || 'StudyMaterial');
    if (input.tags && input.tags.length > 0) {
      params.set('tag', input.tags[0]);
    }
    ogImageUrl = `${baseUrl}/api/og?${params.toString()}`;
  }

  const robots = input.robots || 'index, follow';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: robots.includes('index') && !robots.includes('noindex'),
      follow: robots.includes('follow') && !robots.includes('nofollow'),
      googleBot: {
        index: robots.includes('index') && !robots.includes('noindex'),
        follow: robots.includes('follow') && !robots.includes('nofollow'),
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'StudyMaterial',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      type: input.type === 'profile' ? 'profile' : input.type === 'article' ? 'article' : 'website',
      ...(input.type === 'article' && {
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime,
        authors: input.author ? [input.author] : undefined,
        tags: input.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: METADATA_DEFAULTS.twitterHandle,
      images: [ogImageUrl],
    }
  };
}
