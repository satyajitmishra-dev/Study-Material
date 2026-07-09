import { publicDb } from '@/lib/database/publicDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { items: posts } = await publicDb.getPublicPosts({ limit: 25 });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.dev';

  const xmlContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>StudyMaterial Articles</title>
  <link>${baseUrl}</link>
  <description>Technical articles, guides, and studies on Next.js 16, CSS springs, and AI prompt engineering.</description>
  <language>en-us</language>
  <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
  ${posts.map(post => `
  <item>
    <title>${post.title}</title>
    <link>${baseUrl}/posts/${post.slug}</link>
    <guid>${baseUrl}/posts/${post.slug}</guid>
    <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
    <description>${post.description || ''}</description>
  </item>`).join('')}
</channel>
</rss>`;

  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
    }
  });
}
