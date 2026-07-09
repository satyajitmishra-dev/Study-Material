import { encryptToken, decryptToken } from '../security/encryption';
import { analyzeLocalChanges } from '../automation/localAnalyzer';
import { detectFeatures, classifyChangeCategory } from '../automation/featureDetector';
import { detectLocalTechnologies } from '../automation/techParser';
import { scanForSecrets, validateWebhookUrl } from '../automation/qualityChecker';
import { evaluateTextMetrics } from '../automation/contentGenerator';

async function runTestSuite() {
  console.log('================================================');
  console.log('🚀 GITHUB AI AUTOMATION PLATFORM TESTING SUITE');
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

  // TEST 1: ENCRYPTION & DECRYPTION GCM
  try {
    const rawToken = 'ghp_secretTokenVal123456';
    const encrypted = encryptToken(rawToken);
    const decrypted = decryptToken(encrypted);
    assert(decrypted === rawToken, 'Encryption/Decryption AES-256-GCM round-trip matches');
  } catch (err) {
    console.error('Test 1 failed:', err);
    failedTests++;
  }
  
  // TEST 2: LOCAL CHANGE ANALYZER (No AI)
  try {
    const mockFiles = [
      { filename: 'README.md', status: 'modified', additions: 10, deletions: 0, patch: '' },
      { filename: 'prisma/schema.prisma', status: 'modified', additions: 15, deletions: 2, patch: 'model User {}' },
      { filename: 'package-lock.json', status: 'modified', additions: 100, deletions: 0, patch: '' }
    ];
    const analysis = analyzeLocalChanges('feat: update database user schema', mockFiles);
    
    assert(analysis.isMeaningful, 'Local Analyzer identifies meaningful database modifications');
    assert(analysis.filesChanged === 1, 'Local Analyzer filters out lockfiles and documentation from modified count');
    assert(analysis.insertions === 15, 'Local Analyzer tracks exact insertions count locally');
  } catch (err) {
    console.error('Test 2 failed:', err);
    failedTests++;
  }

  // TEST 3: FEATURE DETECTION ENGINE (No AI)
  try {
    const files = ['prisma/schema.prisma', 'components/ui/button.tsx', 'middleware.ts'];
    const features = detectFeatures(files);
    
    assert(features.includes('Database'), 'Feature Detector maps prisma files to Database');
    assert(features.includes('UI Theme & CSS Styles'), 'Feature Detector maps UI components paths to styling');
    assert(features.includes('Authentication & Middleware'), 'Feature Detector maps middleware files');

    const category = classifyChangeCategory('feat: add support for auth profiles', ['auth.ts']);
    assert(category === 'New Feature', 'Feature Detector maps change category tags from commit prefixes');
  } catch (err) {
    console.error('Test 3 failed:', err);
    failedTests++;
  }

  // TEST 4: TECHNOLOGY DETECTION PARSER (No AI)
  try {
    const stack = detectLocalTechnologies();
    assert(!!stack.framework, 'Tech Stack Parser resolves framework dependencies (e.g. Next.js)');
    assert(stack.libraries.includes('Framer Motion'), 'Tech Stack Parser parses secondary UI/animation libraries');
  } catch (err) {
    console.error('Test 4 failed:', err);
    failedTests++;
  }

  // TEST 5: QUALITY CONTROL & SECRET SCANNING
  try {
    const safeText = 'Looking forward to using the content automation platform!';
    const checkSafe = scanForSecrets(safeText);
    assert(!checkSafe.found, 'Secret scanner ignores safe content');

    const unsafeText = 'AWS Key = AKIA1234567890ABCDEF, please protect it!';
    const checkUnsafe = scanForSecrets(unsafeText);
    assert(checkUnsafe.found && checkUnsafe.types.includes('AwsAccessKey'), 'Secret scanner flags high-entropy AWS credentials');
  } catch (err) {
    console.error('Test 5 failed:', err);
    failedTests++;
  }

  // TEST 6: SSRF PROTECTOR
  try {
    const safeUrl = 'https://hooks.slack.com/services/T123/B456/789';
    const checkSafe = validateWebhookUrl(safeUrl);
    assert(checkSafe.isValid, 'SSRF filter permits public Slack webhook URL');

    const unsafeUrl = 'http://localhost:8080/admin';
    const checkUnsafe = validateWebhookUrl(unsafeUrl);
    assert(!checkUnsafe.isValid, 'SSRF filter blocks local network requests (localhost)');
  } catch (err) {
    console.error('Test 6 failed:', err);
    failedTests++;
  }

  // TEST 7: TEXT READABILITY METRICS
  try {
    const text = '🚀 We just rolled out a new feature! It supports database-backed queues. Join the discussion! #nextjs';
    const metrics = evaluateTextMetrics(text);
    assert(metrics.readingTime === 1, 'Estimated reading time matches text size');
    assert(metrics.engagement >= 5.0, 'Calculates non-zero engagement hook scores');
  } catch (err) {
    console.error('Test 7 failed:', err);
    failedTests++;
  }

  console.log('\n================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================');
  
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
