/**
 * Deterministic mapping rules matching file paths to modules
 */
const PATH_RULES: { pattern: RegExp; moduleName: string }[] = [
  { pattern: /\bprisma\b|\bschema\.prisma\b/, moduleName: 'Database' },
  { pattern: /\bmiddleware\b/, moduleName: 'Authentication & Middleware' },
  { pattern: /\bauth\b/, moduleName: 'Authentication & Authorization' },
  { pattern: /components\/ui|\bstyles\b|\bcss\b/, moduleName: 'UI Theme & CSS Styles' },
  { pattern: /\bcomponents\b/, moduleName: 'UI Component Architecture' },
  { pattern: /app\/api|pages\/api/, moduleName: 'Backend REST APIs' },
  { pattern: /app\/admin/, moduleName: 'Admin Dashboard Control' },
  { pattern: /\bseo\b/, moduleName: 'SEO Studio Engine' },
  { pattern: /\banalytics\b/, moduleName: 'Traffic Analytics Engine' },
  { pattern: /lib\/security|\bencryption\b/, moduleName: 'Security & Encryption' },
  { pattern: /lib\/testing|\btest\b/, moduleName: 'Automated Testing Suite' },
  { pattern: /lib\/actions/, moduleName: 'Next.js Server Actions' },
  { pattern: /app\/learn/, moduleName: 'Interactive Course Portal' },
];

/**
 * Parses files changed and determines affected software modules locally.
 */
export function detectFeatures(files: string[]): string[] {
  const matchedModules = new Set<string>();

  for (const filename of files) {
    const path = filename.toLowerCase();
    for (const rule of PATH_RULES) {
      if (rule.pattern.test(path)) {
        matchedModules.add(rule.moduleName);
      }
    }
  }

  if (matchedModules.size === 0) {
    matchedModules.add('Core Application Architecture');
  }

  return Array.from(matchedModules);
}

/**
 * Classifies the type of software change using local heuristics
 */
export function classifyChangeCategory(commitTitle: string, files: string[]): string {
  const title = commitTitle.toLowerCase();

  // 1. Structural files rules
  if (files.some(f => f.toLowerCase().includes('schema.prisma'))) {
    return 'Database Migration';
  }
  if (files.some(f => f.toLowerCase().includes('lib/testing') || f.toLowerCase().includes('test.ts'))) {
    return 'Testing Update';
  }
  if (files.some(f => f.toLowerCase().includes('lib/security') || f.toLowerCase().includes('encryption.ts'))) {
    return 'Security Improvement';
  }
  if (files.some(f => f.toLowerCase().includes('components/ui') || f.toLowerCase().endsWith('.css'))) {
    return 'UI Enhancement';
  }

  // 2. Commit prefix rules
  if (title.startsWith('feat:')) return 'New Feature';
  if (title.startsWith('fix:')) return 'Bug Fix';
  if (title.startsWith('refactor:')) return 'Refactoring';
  if (title.startsWith('perf:')) return 'Performance Improvement';
  if (title.startsWith('docs:')) return 'Documentation';
  if (title.startsWith('chore:')) return 'Chore/Maintenance';

  // 3. Keyword matching rules
  if (title.includes('fix') || title.includes('bug')) return 'Bug Fix';
  if (title.includes('add') || title.includes('feat') || title.includes('implement')) return 'New Feature';
  if (title.includes('refactor') || title.includes('cleanup')) return 'Refactoring';
  if (title.includes('speed') || title.includes('perf') || title.includes('fast')) return 'Performance Improvement';

  return 'Backend Update';
}
