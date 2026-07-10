import { publicDb } from '@/lib/database/publicDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;

    const { items: posts } = await publicDb.getPublicPosts({
      limit: 100,
      categorySlug
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';

    const xmlContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>StudyMaterial Articles${categorySlug ? ` - ${categorySlug.toUpperCase()}` : ''}</title>
  <link>${baseUrl}</link>
  <description>Technical articles, guides, and studies on modern computer science, frontend development, and AI engineering.</description>
  <language>en-us</language>
  <atom:link href="${baseUrl}/feed.xml${categorySlug ? `?category=${categorySlug}` : ''}" rel="self" type="application/rss+xml" />
  ${posts.map(post => {
      const description = post.description || '';
      const authorName = post.author?.name || 'Sandbox Admin';
      const category = post.categoryRef?.name || 'React';
      return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${baseUrl}/posts/${post.slug}</link>
    <guid>${baseUrl}/posts/${post.slug}</guid>
    <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
    <dc:creator>${escapeXml(authorName)}</dc:creator>
    <category>${escapeXml(category)}</category>
    <description>${escapeXml(description)}</description>
  </item>`;
    }).join('')}
</channel>
</rss>`;

    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
      }
    });
  } catch (err: any) {
    return new Response(`<error>${err.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
