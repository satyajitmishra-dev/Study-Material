export interface QualityAuditResult {
  score: number;
  suggestions: string[];
  readingTimeMin: number;
  wordCount: number;
}

export class QualityScoreEngine {
  public static analyze(title: string, content: string): QualityAuditResult {
    let score = 0;
    const suggestions: string[] = [];

    // 1. Calculate Word Count & Reading Time
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 225)); // avg 225 wpm

    // 2. Title Checks (Max 20 points)
    if (!title || title.trim().length === 0) {
      suggestions.push('Add an engaging title for your publication.');
    } else {
      const titleLen = title.length;
      if (titleLen >= 20 && titleLen <= 80) {
        score += 20;
      } else {
        score += 10;
        suggestions.push('Optimize title length to be between 20 and 80 characters.');
      }
      // Check capitalization
      const words = title.trim().split(/\s+/);
      const isCapitalized = words.every(w => w[0] === w[0]?.toUpperCase());
      if (isCapitalized && words.length > 2) {
        score += 5; // bonus points
      } else if (words.length > 2) {
        suggestions.push('Consider capitalizing the first letters of main words in title.');
      }
    }

    // 3. Length Checks (Max 30 points)
    if (wordCount > 1000) {
      score += 30;
    } else if (wordCount > 500) {
      score += 20;
      suggestions.push('Expand content to over 1,000 words for deeper topic coverage.');
    } else if (wordCount > 200) {
      score += 10;
      suggestions.push('Write a longer draft (aim for at least 500 words).');
    } else {
      suggestions.push('Draft is very short. Add more detailed sections, explanations, or code blocks.');
    }

    // 4. Formatting structure check (headings, code blocks) (Max 20 points)
    const hasHeadings = /<h[1-6]/i.test(content);
    if (hasHeadings) {
      score += 10;
    } else {
      suggestions.push('Structure content with headings (H2, H3) to improve readability.');
    }

    const hasCode = /<pre|<code/i.test(content);
    if (hasCode) {
      score += 10;
    } else {
      suggestions.push('Include code snippets or syntax examples to clarify technical points.');
    }

    // 5. Image Check (Max 15 points)
    const hasImages = /<img/i.test(content);
    if (hasImages) {
      score += 15;
    } else {
      suggestions.push('Embed at least one relevant screenshot or diagram.');
    }

    // 6. Links Check (Max 15 points)
    const hasLinks = /href=/i.test(content);
    if (hasLinks) {
      score += 15;
    } else {
      suggestions.push('Link to reference materials, GitHub repositories, or documentation links.');
    }

    // Cap score at 100
    score = Math.min(100, score);

    return {
      score,
      suggestions,
      readingTimeMin,
      wordCount
    };
  }
}
