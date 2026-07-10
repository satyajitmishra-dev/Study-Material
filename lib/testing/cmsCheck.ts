import { cmsDb } from '../database/cmsDb';
import { CmsProjectSchema } from '../validation/cms';
import { SeoEngine } from '../seo/SeoEngine';
import { rateLimit } from '../security/rateLimit';

async function runTestSuite() {
  console.log('================================================');
  console.log('🚀 ENTERPRISE CMS AUTOMATED VERIFICATION SUITE');
  console.log('================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${message}`);
    } else {
      failedTests++;
      console.log(`❌ [FAIL] ${message}`);
    }
  }

  // --- TEST 1: DATABASE CRUD IN-MEMORY FALLBACK ---
  try {
    const newProject = await cmsDb.createProject({
      id: 'proj_test_suite_1',
      title: 'Testing Suite Integration',
      slug: 'testing-suite-integration',
      description: 'Automated test suite parameters verification post.',
      category: 'TypeScript',
      tags: ['test', 'integration'],
      language: 'en',
      visibility: 'public',
      thumbnail: '',
      coverImage: '',
      content: '<p>Standard testing suite HTML content of length above word count limits.</p>',
      seoTitle: 'Verification Test Title',
      seoDescription: 'Optimized description containing metadata fields details.',
      seoKeywords: 'test, validation',
      ogImage: '',
      canonical: 'https://studymaterial.utool.in/test',
      robots: 'index, follow',
      schemaJson: '{"@context": "https://schema.org"}',
      seoScore: 90,
      status: 'draft',
      scheduledAt: null,
      publishedAt: null,
      versionNote: 'Test creation entry',
      authorId: 'test-author',
      createdAt: new Date(),
      version: 1,
      parentId: null,
      nextProjectId: null,
      prevProjectId: null,
      prerequisiteId: null,
      categoryId: null,
      projectId: null,
      password: null,
    });

    assert(!!newProject.id, 'Database created project and generated unique ID');

    const retrieved = await cmsDb.getProjectById(newProject.id);
    assert(retrieved?.title === 'Testing Suite Integration', 'Database retrieved created project correctly');

    await cmsDb.deleteProject(newProject.id, false);
    const deletedCheck = await cmsDb.getProjectById(newProject.id);
    assert(deletedCheck === null, 'Database deleted project successfully');
  } catch (e: any) {
    console.error('Test 1 Crash:', e);
    failedTests++;
  }

  // --- TEST 2: ZOD VALIDATION SCHEMAS ---
  try {
    const invalidData = {
      title: 'T', // Too short
      slug: 'invalid slug!', // Space and special chars not allowed
      seoScore: 105, // Max 100
      status: 'unknown', // Invalid status enum value
    };

    const res = CmsProjectSchema.safeParse(invalidData);
    assert(!res.success, 'Zod caught invalid constraints (title min-length, slug regex, score limit, enum)');
  } catch (e: any) {
    console.error('Test 2 Crash:', e);
    failedTests++;
  }

  // --- TEST 3: RATE LIMITING SLIDING WINDOW ---
  try {
    const ip = '192.168.1.50';
    // Max 3 hits within 2000ms window
    const hit1 = rateLimit(`test_limit_${ip}`, 3, 2000);
    const hit2 = rateLimit(`test_limit_${ip}`, 3, 2000);
    const hit3 = rateLimit(`test_limit_${ip}`, 3, 2000);
    const hit4 = rateLimit(`test_limit_${ip}`, 3, 2000);

    assert(hit1.success && hit2.success && hit3.success, 'Rate limiter permits safe window hits');
    assert(!hit4.success, 'Rate limiter rejects overflow requests exceeding window cap');
  } catch (e: any) {
    console.error('Test 3 Crash:', e);
    failedTests++;
  }

  // --- TEST 4: SEO SCORING ENGINE ---
  try {
    const analysis = SeoEngine.analyze({
      title: 'Optimized Title Guidelines for Modern Production Apps',
      slug: 'optimized-title-guidelines',
      content: `
        <h2>Article Introduction</h2>
        <p>This is a comprehensive developer tutorial detailing optimized guidelines, layouts, and configurations in modern React frameworks.
        In this guide, we discuss the integration of automatic memoization and spring physical configurations. Developers should review the
        <a href="/learn">internal documentation</a> to configure their dev server. Creating optimized layouts is vital for performance.</p>
        
        <h2>Detailed Guidelines and Architecture</h2>
        <p>When designing these workflows, standard guidelines suggest keeping components small and highly focused. We recommend checking out the
        official <a href="https://nextjs.org">Next.js reference</a> to learn how page shells stream suspense holes. The compiler simplifies
        dependency tracking, which means developers write cleaner code. Let's write more paragraphs to reach the three-hundred words minimum requirement.</p>
        
        <p>To reach a high word count, we should explore all the subtopics in depth. One of the main challenges when dealing with enterprise systems is
        maintaining consistent typography and spacing. Our styling uses curated custom Tailwind setups that look premium. Spacing should follow a strict
        spacing scale to prevent visual shifts. Hover effects and interactive elements make pages feel alive and engage users. In contrast, plain layouts
        can feel boring and cheap. Always prioritize user experience by incorporating smooth micro-animations and transition states.</p>
        
        <p>Furthermore, security is a major pillar. Always sanitize user inputs using frameworks like Zod. Session validation must happen on every admin route,
        preventing unauthorized users from viewing private logs. Cross-site scripting (XSS) and SQL injections are common vulnerabilities that must be
        proactively addressed. Rate limiting should be applied to sensitive operations like authentication endpoints or bulk project edits.
        Following these strict security guidelines ensures that client data remains safe and protected from malicious actors.</p>
        
        <p>Lastly, accessibility checks are non-negotiable. WCAG AA compliance requires keyboard navigation, tab orders, visible focus states, and proper
        ARIA labels. Color contrast ratios must exceed minimum requirements to enable low-vision accessibility. Screen readers must be able to parse the page
        correctly using HTML5 semantic elements. Ensure all form elements have clear matching labels and description blocks. By checking these boxes, you
        create software that is truly usable by everyone, everywhere.</p>
      `,
      seoTitle: 'Optimized Title Guidelines for Modern Production Apps',
      seoDescription: 'Comprehensive step-by-step developer tutorial detailing optimized guidelines, layouts, and spring configurations in Next.js applications.',
      seoKeywords: 'guidelines, optimized',
      canonical: 'https://studymaterial.utool.in/optimized-title-guidelines',
      ogImage: 'https://studymaterial.utool.in/og.jpg',
      schemaJson: '{"@context": "https://schema.org"}',
    });

    assert(analysis.score >= 80, `SEO Engine computes correct optimization score: ${analysis.score}`);
    assert(analysis.audits.length > 0, `SEO Engine generated audits: ${analysis.audits.length} check items`);
    assert(analysis.wordCount > 20, `SEO Engine calculated word count: ${analysis.wordCount}`);
  } catch (e: any) {
    console.error('Test 4 Crash:', e);
    failedTests++;
  }

  console.log('\n================================================');
  console.log(`📊 TESTS SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================');
}

runTestSuite();
