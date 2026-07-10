'use server';

import { getPrisma } from '@/lib/database/dbClient';
import { SeoEngine } from '@/lib/seo/SeoEngine';
import { publicDb } from '@/lib/database/publicDb';
import { revalidatePath } from 'next/cache';

// Helper: Check Admin/Editor role before allowing settings updates
async function verifyAdminAuth() {
  // Mock role check for sandbox environment
  return true;
}

// ==========================================
// --- REDIRECT MANAGER SERVICE ---
// ==========================================

export async function getRedirectsAction() {
  const prisma = getPrisma();
  if (prisma) {
    return { success: true, data: await prisma.cmsRedirect.findMany({ orderBy: { createdAt: 'desc' } }) };
  }
  // Sandbox in-memory fallback
  const mockRedirects = [
    { id: 'redir_1', sourcePath: '/old-react', targetPath: '/posts/introducing-partial-prerendering', statusCode: 301, createdAt: new Date() }
  ];
  return { success: true, data: mockRedirects };
}

export async function saveRedirectAction(sourcePath: string, targetPath: string, statusCode: number = 301) {
  await verifyAdminAuth();
  const prisma = getPrisma();
  
  // Format paths
  const source = sourcePath.trim().toLowerCase();
  const target = targetPath.trim().toLowerCase();

  if (!source.startsWith('/')) {
    return { success: false, error: 'Source path must start with a slash (/).' };
  }

  try {
    if (prisma) {
      const redirect = await prisma.cmsRedirect.upsert({
        where: { sourcePath: source },
        update: { targetPath: target, statusCode },
        create: { sourcePath: source, targetPath: target, statusCode }
      });
      return { success: true, redirect };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteRedirectAction(id: string) {
  await verifyAdminAuth();
  const prisma = getPrisma();
  try {
    if (prisma) {
      await prisma.cmsRedirect.delete({ where: { id } });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// --- COMPETITOR INTELLIGENCE SERVICE ---
// ==========================================

export async function getCompetitorsAction() {
  const prisma = getPrisma();
  if (prisma) {
    return { success: true, data: await prisma.cmsCompetitor.findMany({ orderBy: { domain: 'asc' } }) };
  }
  // Sandbox mockup list
  const mockCompetitors = [
    { id: 'comp_1', domain: 'devdocs.io', name: 'DevDocs Official', estimatedContentDepth: 1200, topicCoverage: 88, freshnessScore: 75, pagePerformance: 94, searchIntentCoverage: 82 },
    { id: 'comp_2', domain: 'refactoring.guru', name: 'RefactoringGuru', estimatedContentDepth: 450, topicCoverage: 62, freshnessScore: 90, pagePerformance: 85, searchIntentCoverage: 78 }
  ];
  return { success: true, data: mockCompetitors };
}

export async function saveCompetitorAction(domain: string, name: string) {
  await verifyAdminAuth();
  const prisma = getPrisma();
  const domainClean = domain.trim().toLowerCase();

  // Simulate premium metrics extraction
  const contentDepth = Math.floor(300 + Math.random() * 1000);
  const coverage = Math.floor(55 + Math.random() * 40);
  const freshness = Math.floor(60 + Math.random() * 35);
  const performance = Math.floor(70 + Math.random() * 28);
  const intent = Math.floor(50 + Math.random() * 45);

  try {
    if (prisma) {
      const competitor = await prisma.cmsCompetitor.upsert({
        where: { domain: domainClean },
        update: { name },
        create: { 
          domain: domainClean, 
          name,
          estimatedContentDepth: contentDepth,
          topicCoverage: coverage,
          freshnessScore: freshness,
          pagePerformance: performance,
          searchIntentCoverage: intent
        }
      });
      return { success: true, competitor };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCompetitorAction(id: string) {
  await verifyAdminAuth();
  const prisma = getPrisma();
  try {
    if (prisma) {
      await prisma.cmsCompetitor.delete({ where: { id } });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// --- SEARCH ANALYTICS CTR LOGS ---
// ==========================================

export async function logSearchQueryAction(query: string, clicked: boolean = false) {
  const prisma = getPrisma();
  const term = query.trim().toLowerCase();
  if (!term) return { success: false };

  try {
    if (prisma) {
      const existing = await prisma.cmsSearchQuery.findUnique({
        where: { query: term }
      });

      if (existing) {
        const count = existing.count + 1;
        const clicks = existing.clicks + (clicked ? 1 : 0);
        const impressions = count; // Assume impressions equal search counts
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        await prisma.cmsSearchQuery.update({
          where: { query: term },
          data: { count, clicks, impressions, ctr }
        });
      } else {
        await prisma.cmsSearchQuery.create({
          data: {
            query: term,
            count: 1,
            clicks: clicked ? 1 : 0,
            impressions: 1,
            ctr: clicked ? 100 : 0
          }
        });
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'LOGGING_FAILED' };
  }
}

export async function getSearchQueryAnalyticsAction() {
  const prisma = getPrisma();
  if (prisma) {
    return { success: true, data: await prisma.cmsSearchQuery.findMany({ orderBy: { count: 'desc' }, take: 100 }) };
  }
  // Sandbox mockup queries
  const mockQueries = [
    { query: 'next.js 16', count: 124, clicks: 82, impressions: 124, ctr: 66.1 },
    { query: 'ppr', count: 98, clicks: 45, impressions: 98, ctr: 45.9 },
    { query: 'framer motion', count: 54, clicks: 12, impressions: 54, ctr: 22.2 }
  ];
  return { success: true, data: mockQueries };
}

// ==========================================
// --- CMS GLOBAL SEO AUDIT REPORT ---
// ==========================================

export async function getSeoHealthReportAction() {
  const prisma = getPrisma();
  try {
    let posts: any[] = [];
    if (prisma) {
      posts = await prisma.cmsProject.findMany({
        where: { status: 'published' },
        include: {
          author: { include: { authorProfile: true } },
          categoryRef: true,
          postTags: { include: { tag: true } }
        }
      });
    } else {
      // In-Memory sandbox posts fetch
      const res = await publicDb.getPublicPosts({ limit: 100 });
      posts = res.items;
    }

    // Run dynamic audits across all posts using SeoEngine
    let totalScoreSum = 0;
    let missingMetaTitleCount = 0;
    let missingMetaDescCount = 0;
    let thinContentCount = 0;
    let duplicateTitles: Record<string, number> = {};
    let duplicateDescs: Record<string, number> = {};
    let missingAltCount = 0;
    let orphanCount = 0;

    const auditedPosts = posts.map(post => {
      const contentText = post.content || '';
      // Simple HTML/Tiptap text conversion
      let plainText = '';
      try {
        const jsonDoc = JSON.parse(contentText);
        plainText = JSON.stringify(jsonDoc);
      } catch (e) {
        plainText = contentText;
      }

      const analysis = SeoEngine.analyze({
        title: post.title || '',
        slug: post.slug || '',
        content: plainText,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        seoKeywords: post.seoKeywords,
        canonical: post.canonical,
        ogImage: post.ogImage,
        schemaJson: post.schemaJson
      });

      totalScoreSum += analysis.score;

      // Track duplicate indicators
      const normalizedTitle = (post.seoTitle || post.title || '').trim().toLowerCase();
      const normalizedDesc = (post.seoDescription || '').trim().toLowerCase();

      if (normalizedTitle) {
        duplicateTitles[normalizedTitle] = (duplicateTitles[normalizedTitle] || 0) + 1;
      }
      if (normalizedDesc) {
        duplicateDescs[normalizedDesc] = (duplicateDescs[normalizedDesc] || 0) + 1;
      }

      // Track metric warnings
      if (!post.seoTitle && !post.title) missingMetaTitleCount++;
      if (!post.seoDescription) missingMetaDescCount++;
      if (analysis.wordCount < 300) thinContentCount++;

      // Extract alt warnings
      const altMatches = contentText.match(/<img[^>]*>/gi) || [];
      altMatches.forEach((img: string) => {
        if (!img.includes('alt=') || /alt=["']\s*["']/i.test(img)) {
          missingAltCount++;
        }
      });

      // Simple orphan verification (no parent, next/prev, category links, or series references)
      const isOrphan = !post.parentId && !post.nextProjectId && !post.prevProjectId && !post.categoryId;
      if (isOrphan) orphanCount++;

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        score: analysis.score,
        audits: analysis.audits
      };
    });

    const totalPosts = auditedPosts.length;
    const globalAverageScore = totalPosts > 0 ? Math.round(totalScoreSum / totalPosts) : 100;

    // Filter duplicates
    const duplicateTitleCount = Object.values(duplicateTitles).filter(c => c > 1).length;
    const duplicateDescCount = Object.values(duplicateDescs).filter(c => c > 1).length;

    return {
      success: true,
      report: {
        globalAverageScore,
        totalPosts,
        missingMetaTitleCount,
        missingMetaDescCount,
        thinContentCount,
        duplicateTitleCount,
        duplicateDescCount,
        missingAltCount,
        orphanCount,
        posts: auditedPosts
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
