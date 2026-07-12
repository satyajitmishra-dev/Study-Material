import { z } from 'zod';

export const RESERVED_WORDS = [
  'admin', 'api', 'login', 'register', 'dashboard', 'settings',
  'support', 'utool', 'studymaterial', 'system', 'profile',
  'projects', 'posts', 'categories', 'tags', 'learn', 'unauthorized',
  'u', 'feed', 'search', 'saved', 'sitemap', 'robots', 'static', 'assets'
];

/**
 * Validates username string and returns detailed message if invalid.
 */
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const clean = username.trim().toLowerCase();
  if (clean.length < 3 || clean.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters.' };
  }
  if (!/^[a-z0-9-]+$/.test(clean)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, and hyphens.' };
  }
  if (clean.includes('--')) {
    return { valid: false, error: 'Username cannot contain consecutive hyphens.' };
  }
  if (clean.startsWith('-') || clean.endsWith('-')) {
    return { valid: false, error: 'Username cannot start or end with a hyphen.' };
  }
  if (RESERVED_WORDS.includes(clean)) {
    return { valid: false, error: 'This username is reserved and unavailable.' };
  }
  return { valid: true };
}

/**
 * Sanitizes input text by removing HTML, script tags, markdown headings,
 * trimming leading/trailing spaces, and consolidating duplicate blank lines.
 */
export function sanitizeProfileText(text: string, options: { removeMarkdownHeadings?: boolean } = {}): string {
  if (!text) return '';
  let clean = text;

  // 1. Remove script tags
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 2. Remove all other HTML tags
  clean = clean.replace(/<[^>]*>/g, '');
  
  // 3. Remove markdown headings
  if (options.removeMarkdownHeadings) {
    clean = clean.replace(/^#+\s+/gm, '');
  }

  // 4. Consolidate duplicate blank lines (maximum 1 blank line in between)
  clean = clean.replace(/\n{3,}/g, '\n\n');

  // 5. Trim spaces on each line and remove trailing/leading spaces of overall text
  clean = clean.split('\n').map(line => line.trim()).join('\n').trim();

  return clean;
}

/**
 * Validates url formats (optional urls)
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Zod Schema for Developer Profile Form
export const DeveloperProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .refine(val => validateUsernameFormat(val).valid, {
      message: 'Invalid username format (lowercase letters, numbers, hyphens only, no consecutive hyphens)'
    }),
  headline: z.string()
    .max(80, 'Headline cannot exceed 80 characters')
    .transform(val => sanitizeProfileText(val, { removeMarkdownHeadings: true })),
  bio: z.string()
    .max(300, 'Bio cannot exceed 300 characters')
    .transform(val => sanitizeProfileText(val, { removeMarkdownHeadings: true })),
  location: z.string().max(100).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  github: z.string().url().or(z.literal('')).optional(),
  linkedin: z.string().url().or(z.literal('')).optional(),
  twitter: z.string().url().or(z.literal('')).optional(),
  portfolio: z.string().url().or(z.literal('')).optional(),
  youtube: z.string().url().or(z.literal('')).optional(),
  discord: z.string().url().or(z.literal('')).optional(),
  hashnode: z.string().url().or(z.literal('')).optional(),
  devto: z.string().url().or(z.literal('')).optional(),
  leetcode: z.string().url().or(z.literal('')).optional(),
  codeforces: z.string().url().or(z.literal('')).optional(),
  codechef: z.string().url().or(z.literal('')).optional(),
  hackerrank: z.string().url().or(z.literal('')).optional(),
  medium: z.string().url().or(z.literal('')).optional(),
  experienceLevel: z.string().optional(),
  availability: z.string().optional(),
});

/**
 * Sanitizes markdown content against XSS vectors (dangerous URL schemes and event handlers).
 */
export function sanitizeMarkdownXSS(markdown: string): string {
  if (!markdown) return '';
  let safe = markdown;
  // Neutralize javascript: / vbscript: / data: schemes in links or embeds
  safe = safe.replace(/href\s*=\s*["']?\s*(?:javascript|vbscript|data:text\/html):[^"'\s>]*/gi, 'href="#"');
  safe = safe.replace(/src\s*=\s*["']?\s*(?:javascript|vbscript|data:text\/html):[^"'\s>]*/gi, 'src=""');
  // Strip inline event attributes like onerror=, onload=, onclick=
  safe = safe.replace(/\b(?:on\w+)\s*=\s*["'][^"']*["']/gi, '');
  return safe;
}
