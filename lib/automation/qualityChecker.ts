import { URL } from 'url';

/**
 * High-entropy secret scanning regex patterns
 */
const SECRET_PATTERNS = {
  GitHubToken: /\b(gh[pso]_[a-zA-Z0-9]{36,255}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/,
  OpenAiKey: /\bsk-[a-zA-Z0-9]{20}T3BlbkFJ[a-zA-Z0-9]{20}\b/,
  SlackWebhook: /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{9}\/[A-Z0-9]{9}\/[a-zA-Z0-9]{24}/,
  AwsAccessKey: /\bAKIA[0-9A-Z]{16}\b/,
  DatabaseUrl: /postgresql?:\/\/[a-zA-Z0-9_.-]+:[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+:[0-9]+\/[a-zA-Z0-9_.-]+/,
  PrivateKey: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/,
};

/**
 * Scans content for accidental credentials leakage
 */
export function scanForSecrets(text: string): { found: boolean; types: string[] } {
  const types: string[] = [];
  
  Object.entries(SECRET_PATTERNS).forEach(([name, regex]) => {
    if (regex.test(text)) {
      types.push(name);
    }
  });

  return {
    found: types.length > 0,
    types,
  };
}

/**
 * Validates target webhook URLs to prevent Server-Side Request Forgery (SSRF)
 */
export function validateWebhookUrl(urlStr: string): { isValid: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // Block local / private IP patterns
    const privatePatterns = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./, // Link-local / metadata endpoint
      /^0\./,
    ];

    const isPrivate = privatePatterns.some(rx => rx.test(hostname));
    if (isPrivate) {
      return { isValid: false, reason: 'Local/Internal network destinations are forbidden (SSRF Protection).' };
    }

    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Only HTTPS destinations are allowed.' };
    }

    return { isValid: true };
  } catch (err) {
    return { isValid: false, reason: 'Invalid URL structure.' };
  }
}

/**
 * Checks platform constraints (character counts, format, tags, etc.)
 */
export function validatePlatformConstraints(
  platform: string,
  content: string,
  title?: string
): { success: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const length = content.length;

  // Secret scan first
  const secrets = scanForSecrets(content);
  if (secrets.found) {
    errors.push(`Secret Leakage Detected: High-entropy keys matching ${secrets.types.join(', ')} found!`);
  }

  // Check platforms
  if (platform === 'twitter') {
    if (length > 280) {
      warnings.push(`Content exceeds X (Twitter) standard limit of 280 characters (Length: ${length}). Ensure you are posting as a Thread.`);
    }
  } else if (platform === 'linkedin') {
    if (length > 3000) {
      errors.push(`Content exceeds LinkedIn limit of 3,000 characters (Length: ${length}).`);
    }
  } else if (['devto', 'hashnode', 'medium'].includes(platform)) {
    if (!title || title.trim().length < 5) {
      errors.push('Blogging articles require a title of at least 5 characters.');
    }
    if (length < 100) {
      errors.push('Blogging articles must contain at least 100 characters of Markdown text.');
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detects duplicate topics or titles using Jaccard Similarity index
 */
export function detectDuplicateContent(title: string, previousTitles: string[]): boolean {
  if (previousTitles.length === 0) return false;

  const tokenize = (str: string) => new Set(str.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const tTokens = tokenize(title);

  for (const prev of previousTitles) {
    const pTokens = tokenize(prev);
    
    // Intersection size
    const intersection = new Set([...tTokens].filter(x => pTokens.has(x)));
    // Union size
    const union = new Set([...tTokens, ...pTokens]);
    
    const similarity = intersection.size / union.size;
    if (similarity > 0.6) {
      return true; // More than 60% words overlap, potential duplicate
    }
  }

  return false;
}
