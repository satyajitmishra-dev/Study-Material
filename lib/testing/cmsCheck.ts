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
      canonical: 'https://studymaterial.dev/test',
      robots: 'index, follow',
      schemaJson: '{"@context": "https://schema.org"}',
      seoScore: 90,
      status: 'draft',
      scheduledAt: null,
      publishedAt: null,
      versionNote: 'Test creation entry',
      authorId: 'test-author',
      createdAt: new Date(),
    });

    assert(!!newProject.id, 'Database created project and generated unique ID');
    
    const retrieved = await cmsDb.getProjectById(newProject.id);
    assert(retrieved?.title === 'Testing Suite Integration', 'Database retrieved created project correctly');

    await cmsDb.deleteProject(newProject.id);
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
      title: 'Optimized Title Guidelines',
      slug: 'optimized-title-guidelines',
      content: `
        <h2>Article Introduction</h2>
        <p>This is a comprehensive developer tutorial detailing layouts and configurations. 
        It discusses the integration of automatic memoization and spring physical configurations.</p>
        <p>Using these optimized title guidelines will ensure that search engines index pages quickly and rank them high.</p>
      `,
      seoTitle: 'Optimized Title Guidelines',
      seoDescription: 'Comprehensive step-by-step developer tutorial detailing layouts and configurations.',
      seoKeywords: 'guidelines, optimized',
      canonical: 'https://studymaterial.dev/optimized-title-guidelines',
      ogImage: 'https://studymaterial.dev/og.jpg',
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
