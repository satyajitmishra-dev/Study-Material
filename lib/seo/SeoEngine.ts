export interface SeoAuditResult {
  id: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  impact: 'high' | 'medium' | 'low';
  category: 'title' | 'description' | 'content' | 'links' | 'schema' | 'keywords';
}

export interface SeoAnalysis {
  score: number;
  audits: SeoAuditResult[];
  readingTimeMin: number;
  wordCount: number;
}

export class SeoEngine {
  static analyze(data: {
    title: string;
    slug: string;
    content: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    canonical?: string | null;
    ogImage?: string | null;
    schemaJson?: string | null;
  }): SeoAnalysis {
    const audits: SeoAuditResult[] = [];
    let score = 100;

    const title = data.title || '';
    const slug = data.slug || '';
    const content = data.content || '';
    const seoTitle = data.seoTitle || '';
    const seoDescription = data.seoDescription || '';
    const keywordsRaw = data.seoKeywords || '';
    const canonical = data.canonical || '';
    const ogImage = data.ogImage || '';
    const schemaJson = data.schemaJson || '';

    // Helper: strip HTML tags to get pure text content
    const plainTextContent = content.replace(/<[^>]*>/g, ' ');
    const words = plainTextContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

    // --- 1. TITLE AUDITS ---
    const targetTitle = seoTitle || title;
    if (!targetTitle) {
      score -= 20;
      audits.push({
        id: 'title_missing',
        status: 'error',
        message: 'Meta Title is completely missing.',
        impact: 'high',
        category: 'title'
      });
    } else {
      const len = targetTitle.length;
      if (len < 40) {
        score -= 8;
        audits.push({
          id: 'title_too_short',
          status: 'warning',
          message: `Title is too short (${len} chars). Aim for 50-60 characters for best SERP visibility.`,
          impact: 'medium',
          category: 'title'
        });
      } else if (len > 60) {
        score -= 6;
        audits.push({
          id: 'title_too_long',
          status: 'warning',
          message: `Title is too long (${len} chars). Search engines will truncate it in SERP results (keep under 60).`,
          impact: 'medium',
          category: 'title'
        });
      } else {
        audits.push({
          id: 'title_perfect',
          status: 'success',
          message: `Meta Title is perfectly sized (${len} characters).`,
          impact: 'low',
          category: 'title'
        });
      }
    }

    // --- 2. DESCRIPTION AUDITS ---
    if (!seoDescription) {
      score -= 20;
      audits.push({
        id: 'desc_missing',
        status: 'error',
        message: 'Meta Description is completely missing.',
        impact: 'high',
        category: 'description'
      });
    } else {
      const len = seoDescription.length;
      if (len < 100) {
        score -= 8;
        audits.push({
          id: 'desc_too_short',
          status: 'warning',
          message: `Description is too short (${len} chars). Add more descriptive details (aim for 120-160 characters).`,
          impact: 'medium',
          category: 'description'
        });
      } else if (len > 160) {
        score -= 8;
        audits.push({
          id: 'desc_too_long',
          status: 'warning',
          message: `Description is too long (${len} chars). Search snippets truncate texts above 160 characters.`,
          impact: 'medium',
          category: 'description'
        });
      } else {
        audits.push({
          id: 'desc_perfect',
          status: 'success',
          message: `Meta Description length is perfect (${len} characters).`,
          impact: 'low',
          category: 'description'
        });
      }
    }

    // --- 3. KEYWORDS DENSITY & PLACEMENT ---
    const keywords = keywordsRaw
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (keywords.length === 0) {
      score -= 15;
      audits.push({
        id: 'keywords_empty',
        status: 'warning',
        message: 'No focus keywords specified. Add focus keywords to benchmark SEO density.',
        impact: 'high',
        category: 'keywords'
      });
    } else {
      const focusKeyword = keywords[0].toLowerCase();
      
      // Keyword in Title
      if (!targetTitle.toLowerCase().includes(focusKeyword)) {
        score -= 10;
        audits.push({
          id: 'keyword_title_missing',
          status: 'error',
          message: `Primary keyword "${focusKeyword}" is missing from the Meta Title.`,
          impact: 'high',
          category: 'keywords'
        });
      }

      // Keyword in Description
      if (!seoDescription.toLowerCase().includes(focusKeyword)) {
        score -= 8;
        audits.push({
          id: 'keyword_desc_missing',
          status: 'warning',
          message: `Primary keyword "${focusKeyword}" is missing from the Meta Description.`,
          impact: 'medium',
          category: 'keywords'
        });
      }

      // Keyword in Slug
      if (!slug.toLowerCase().includes(focusKeyword.replace(/\s+/g, '-'))) {
        score -= 8;
        audits.push({
          id: 'keyword_slug_missing',
          status: 'warning',
          message: `Primary keyword "${focusKeyword}" is missing from the URL slug.`,
          impact: 'medium',
          category: 'keywords'
        });
      }

      // Density calculation in body content
      if (wordCount > 0) {
        const regex = new RegExp(`\\b${focusKeyword}\\b`, 'gi');
        const matches = plainTextContent.match(regex);
        const count = matches ? matches.length : 0;
        const densityPercent = (count / wordCount) * 100;

        if (count === 0) {
          score -= 12;
          audits.push({
            id: 'keyword_density_zero',
            status: 'error',
            message: `Primary keyword "${focusKeyword}" does not appear in the body content.`,
            impact: 'high',
            category: 'keywords'
          });
        } else if (densityPercent < 0.5) {
          score -= 5;
          audits.push({
            id: 'keyword_density_low',
            status: 'warning',
            message: `Keyword density is low (${densityPercent.toFixed(2)}%). Add focus keywords to sections naturally.`,
            impact: 'low',
            category: 'keywords'
          });
        } else if (densityPercent > 3.5) {
          score -= 10;
          audits.push({
            id: 'keyword_stuffing',
            status: 'error',
            message: `Keyword stuffing detected! Density is ${densityPercent.toFixed(2)}% (aim for 0.5% - 2.5%).`,
            impact: 'high',
            category: 'keywords'
          });
        } else {
          audits.push({
            id: 'keyword_density_perfect',
            status: 'success',
            message: `Keyword density is perfect (${densityPercent.toFixed(2)}% — appeared ${count} times).`,
            impact: 'low',
            category: 'keywords'
          });
        }
      }
    }

    // --- 4. HEADING HIERARCHY AUDITS ---
    const h1Matches = content.match(/<h1[^>]*>/gi) || [];
    const h2Matches = content.match(/<h2[^>]*>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>/gi) || [];

    if (h1Matches.length > 1) {
      score -= 10;
      audits.push({
        id: 'multiple_h1',
        status: 'error',
        message: `Multiple H1 tags detected (${h1Matches.length}). Use only one single H1 tag for page title.`,
        impact: 'high',
        category: 'content'
      });
    }

    if (h2Matches.length === 0) {
      score -= 5;
      audits.push({
        id: 'no_h2',
        status: 'warning',
        message: 'No H2 headers found. Break content sections with H2 tags for scannability.',
        impact: 'medium',
        category: 'content'
      });
    }

    // --- 5. IMAGE ALT AUDITS ---
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    let missingAltCount = 0;
    
    imgMatches.forEach(img => {
      if (!img.includes('alt=') || /alt=["']\s*["']/i.test(img)) {
        missingAltCount++;
      }
    });

    if (imgMatches.length > 0) {
      if (missingAltCount > 0) {
        score -= Math.min(15, missingAltCount * 4);
        audits.push({
          id: 'images_missing_alt',
          status: 'error',
          message: `${missingAltCount} image(s) inside content are missing descriptive alt="" attributes.`,
          impact: 'high',
          category: 'content'
        });
      } else {
        audits.push({
          id: 'images_alt_perfect',
          status: 'success',
          message: 'All images inside content have descriptive alternative text attributes.',
          impact: 'low',
          category: 'content'
        });
      }
    }

    // --- 6. LINK PROFILE AUDITS ---
    const aMatches = content.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi) || [];
    let internalCount = 0;
    let externalCount = 0;

    aMatches.forEach(tag => {
      const hrefMatch = tag.match(/href="([^"]*)"/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        if (href.startsWith('http://') || href.startsWith('https://')) {
          externalCount++;
        } else if (href.startsWith('/') || href.startsWith('#') || href.includes('studymaterial.dev')) {
          internalCount++;
        }
      }
    });

    if (internalCount === 0) {
      score -= 8;
      audits.push({
        id: 'links_no_internal',
        status: 'warning',
        message: 'No internal links found. Link to other workspace docs to increase page rank.',
        impact: 'medium',
        category: 'links'
      });
    } else {
      audits.push({
        id: 'links_internal_ok',
        status: 'success',
        message: `Found ${internalCount} internal site connection link(s).`,
        impact: 'low',
        category: 'links'
      });
    }

    if (externalCount === 0) {
      score -= 5;
      audits.push({
        id: 'links_no_external',
        status: 'warning',
        message: 'No external links found. Link to authority pages or references.',
        impact: 'low',
        category: 'links'
      });
    }

    // --- 7. THIN CONTENT CHECK ---
    if (wordCount < 300) {
      score -= 15;
      audits.push({
        id: 'content_thin',
        status: 'error',
        message: `Thin content detected (${wordCount} words). Add more details (aim for at least 300 words).`,
        impact: 'high',
        category: 'content'
      });
    } else {
      audits.push({
        id: 'content_length_ok',
        status: 'success',
        message: `Content length is excellent (${wordCount} words).`,
        impact: 'low',
        category: 'content'
      });
    }

    // --- 8. TECHNICAL & META TAGS ---
    if (!canonical) {
      score -= 10;
      audits.push({
        id: 'canonical_missing',
        status: 'error',
        message: 'Canonical URL is missing. Add canonical tag to prevent duplicate content indexing.',
        impact: 'medium',
        category: 'schema'
      });
    } else {
      audits.push({
        id: 'canonical_ok',
        status: 'success',
        message: 'Canonical URL is set.',
        impact: 'low',
        category: 'schema'
      });
    }

    if (!schemaJson) {
      score -= 8;
      audits.push({
        id: 'schema_missing',
        status: 'warning',
        message: 'No structured JSON-LD schema found. Set schema markup (Article, FAQ) to unlock Google rich cards.',
        impact: 'medium',
        category: 'schema'
      });
    } else {
      try {
        JSON.parse(schemaJson);
        audits.push({
          id: 'schema_ok',
          status: 'success',
          message: 'Structured JSON-LD schema is valid and parses successfully.',
          impact: 'low',
          category: 'schema'
        });
      } catch (e) {
        score -= 10;
        audits.push({
          id: 'schema_invalid',
          status: 'error',
          message: 'Structured schema json is invalid. Check for missing quotes or brackets.',
          impact: 'high',
          category: 'schema'
        });
      }
    }

    if (!ogImage) {
      score -= 5;
      audits.push({
        id: 'social_card_missing',
        status: 'warning',
        message: 'OpenGraph/Social Card image is missing. Social shares will display blank blocks.',
        impact: 'low',
        category: 'schema'
      });
    }

    return {
      score: Math.max(0, score),
      audits,
      readingTimeMin,
      wordCount
    };
  }
}
