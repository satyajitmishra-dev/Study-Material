import fs from 'fs';
import path from 'path';

export interface TechStack {
  framework: string;
  database: string;
  orm: string;
  auth: string;
  styling: string;
  libraries: string[];
}

/**
 * Parses package.json in the workspace root to resolve active technologies.
 * Gracefully falls back to mock stack if package.json is missing or unreadable.
 */
export function detectLocalTechnologies(workspaceRoot?: string): TechStack {
  const root = workspaceRoot || process.cwd();
  const pkgPath = path.join(root, 'package.json');

  const defaultStack: TechStack = {
    framework: 'Next.js 16 (React 19)',
    database: 'PostgreSQL',
    orm: 'Prisma Client',
    auth: 'Auth.js (Next-Auth)',
    styling: 'TailwindCSS v4',
    libraries: ['Framer Motion', 'Recharts', 'React Hook Form', 'Prisma PG Adapter'],
  };

  try {
    if (!fs.existsSync(pkgPath)) {
      return defaultStack;
    }

    const fileContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(fileContent);

    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const libs: string[] = [];

    let framework = 'React';
    if (deps['next']) framework = 'Next.js';
    if (deps['react-native']) framework = 'React Native';

    let orm = 'None';
    if (deps['prisma'] || deps['@prisma/client']) orm = 'Prisma Client';
    if (deps['drizzle-orm']) orm = 'Drizzle ORM';

    let database = 'SQLite';
    if (deps['pg'] || deps['pg-pool']) database = 'PostgreSQL';
    if (deps['mysql2']) database = 'MySQL';
    if (deps['mongodb']) database = 'MongoDB';

    let auth = 'None';
    if (deps['next-auth'] || deps['@auth/core']) auth = 'Auth.js (Next-Auth)';
    if (deps['@clerk/nextjs']) auth = 'Clerk Auth';

    let styling = 'CSS';
    if (deps['tailwindcss']) styling = 'TailwindCSS';
    if (deps['sass']) styling = 'SASS';

    // Parse libraries
    if (deps['framer-motion']) libs.push('Framer Motion');
    if (deps['recharts']) libs.push('Recharts');
    if (deps['react-hook-form']) libs.push('React Hook Form');
    if (deps['@tanstack/react-query']) libs.push('React Query');
    if (deps['zod']) libs.push('Zod Validation');

    return {
      framework,
      database,
      orm,
      auth,
      styling,
      libraries: libs,
    };
  } catch (err) {
    return defaultStack;
  }
}

/**
 * Returns flat list of technologies for structured AI summaries
 */
export function getFlatTechnologies(workspaceRoot?: string): string[] {
  const stack = detectLocalTechnologies(workspaceRoot);
  const list = [stack.framework, stack.database, stack.orm, stack.auth, stack.styling];
  return [...list, ...stack.libraries].filter(t => t !== 'None');
}
