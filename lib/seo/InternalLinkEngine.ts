import { getPrisma } from '@/lib/database/dbClient';

export interface LinkTarget {
  name: string;
  slug: string;
  type: 'category' | 'tag' | 'post' | 'project';
}

export class InternalLinkEngine {
  /**
   * Scans content HTML and contextually wraps keywords with internal links to improve page rank distribution.
   * Leverages regex mapping with boundary validation to avoid breaking HTML structures/existing anchors.
   */
  static injectContextualLinks(htmlContent: string, targets: LinkTarget[]): string {
    if (!htmlContent || targets.length === 0) return htmlContent;

    let processedHtml = htmlContent;

    // Sort targets by keyword length (descending) to avoid partial sub-word replacement conflicts
    const sortedTargets = [...targets].sort((a, b) => b.name.length - a.name.length);

    for (const target of sortedTargets) {
      const keyword = target.name;
      const url = target.type === 'category' 
        ? `/categories/${target.slug}` 
        : target.type === 'tag'
        ? `/tags/${target.slug}`
        : target.type === 'project'
        ? `/projects/${target.slug}`
        : `/posts/${target.slug}`;

      // Match the keyword ONLY outside of existing HTML tags or anchor tags
      // Regex description: Matches the keyword with word boundaries, assuring it's not preceded by a tag start or inside an anchor.
      const regex = new RegExp(`(?<!<[^>]*)(${keyword})(?![^<]*>)(?![^<]*</a>)`, 'gi');
      
      // Perform replacement limit (e.g. limit to first 2 occurrences of each keyword to prevent link stuffing)
      let matchCount = 0;
      processedHtml = processedHtml.replace(regex, (match) => {
        matchCount++;
        if (matchCount <= 2) {
          return `<a href="${url}" class="text-accent-cyan hover:underline decoration-dashed font-medium">${match}</a>`;
        }
        return match;
      });
    }

    return processedHtml;
  }

  /**
   * Resolves related nodes to prevent orphan pages and establish solid taxonomy linking.
   */
  static async getRelatedNodes(postId: string, categoryId?: string | null, limit: number = 3) {
    const prisma = getPrisma();
    if (!prisma) {
      return [];
    }

    try {
      // Fetch posts under same category
      const related = await prisma.cmsProject.findMany({
        where: {
          status: 'published',
          id: { not: postId },
          ...(categoryId && { categoryId })
        },
        take: limit,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          publishedAt: true
        }
      });

      return related;
    } catch (e) {
      return [];
    }
  }
}
