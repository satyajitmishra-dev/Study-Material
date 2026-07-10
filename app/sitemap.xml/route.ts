import { publicDb } from '@/lib/database/publicDb';
import { getPrisma } from '@/lib/database/dbClient';
import { MOCK_COURSES } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';
  const prisma = getPrisma();

  // Fetch posts
  const { items: posts } = await publicDb.getPublicPosts({ limit: 1000 });

  // Fetch categories
  const categories = await publicDb.getCategories();

  // Fetch tags
  const tags = await publicDb.getTags();

  // Fetch projects
  const projects = await publicDb.getShowcaseProjects();

  // Fetch authors
  let usernames: string[] = ['satyajit', 'developer'];
  if (prisma) {
    try {
      const users = await prisma.user.findMany({
        where: { NOT: { username: null } },
        select: { username: true }
      });
      usernames = users.map(u => u.username!).filter(Boolean);
    } catch (e) {
      // Fallback
    }
  }

  // XML construction
  const urls: Array<{
    loc: string;
    changefreq: string;
    priority: string;
    lastmod?: string;
    image?: { loc: string; title: string };
  }> = [
      { loc: `${baseUrl}`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/posts`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/categories`, changefreq: 'weekly', priority: '0.6' },
      { loc: `${baseUrl}/tags`, changefreq: 'weekly', priority: '0.6' },
      { loc: `${baseUrl}/projects`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/learn`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/search`, changefreq: 'monthly', priority: '0.3' }
    ];

  // Add posts
  posts.forEach(post => {
    urls.push({
      loc: `${baseUrl}/posts/${post.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: new Date(post.updatedAt).toISOString().split('T')[0],
      image: post.coverImage ? { loc: post.coverImage, title: post.title } : undefined
    } as any);
  });

  // Add categories
  categories.forEach(cat => {
    urls.push({
      loc: `${baseUrl}/categories/${cat.slug}`,
      changefreq: 'weekly',
      priority: '0.6'
    } as any);
  });

  // Add tags
  tags.forEach(tag => {
    urls.push({
      loc: `${baseUrl}/tags/${tag.slug}`,
      changefreq: 'weekly',
      priority: '0.6'
    } as any);
  });

  // Add projects
  projects.forEach(proj => {
    urls.push({
      loc: `${baseUrl}/projects/${proj.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
      image: proj.banner ? { loc: proj.banner, title: proj.name } : undefined
    } as any);
  });

  // Add authors
  usernames.forEach(username => {
    urls.push({
      loc: `${baseUrl}/authors/${username}`,
      changefreq: 'weekly',
      priority: '0.5'
    } as any);
  });

  // Add courses
  MOCK_COURSES.forEach(course => {
    urls.push({
      loc: `${baseUrl}/learn/${course.id}`,
      changefreq: 'weekly',
      priority: '0.8'
    } as any);
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${(url as any).image ? `
    <image:image>
      <image:loc>${(url as any).image.loc}</image:loc>
      <image:title>${(url as any).image.title}</image:title>
    </image:image>` : ''}
  </url>`).join('')}
</urlset>`;

  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
    }
  });
}

