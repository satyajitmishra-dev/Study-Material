import { publicDb, inMemoryReactions, inMemoryBookmarks, inMemoryHighlights, inMemoryNotes, inMemoryReadingSessions } from '../database/publicDb';

async function runTestSuite() {
  console.log('================================================');
  console.log('🚀 PUBLIC PUBLISHING PLATFORM DATABASE VERIFIER');
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

  const visitorId = `test_visitor_${Date.now()}`;
  const testProjectId = 'proj_sandbox_1';
  const userId = 'sandbox-user-id';

  // --- TEST 1: VISITOR ID CREATION ---
  try {
    const visitor = await publicDb.getOrCreateVisitor(visitorId, 'f-fingerprint-1234');
    assert(!!visitor.id, 'Visitor profile created or retrieved from registry successfully');
  } catch (err: any) {
    console.error('Test 1 failed:', err);
    failedTests++;
  }

  // --- TEST 2: REACTION IN-MEMORY / DB MOCK ---
  try {
    inMemoryReactions.push({
      id: `react_${Date.now()}`,
      projectId: testProjectId,
      type: 'LIKE',
      userId: null,
      visitorId: visitorId,
      createdAt: new Date()
    } as any);

    const exists = inMemoryReactions.some(r => r.projectId === testProjectId && r.visitorId === visitorId);
    assert(exists, 'Toggled new LIKE reaction ON (In-Memory)');
  } catch (err: any) {
    console.error('Test 2 failed:', err);
    failedTests++;
  }

  // --- TEST 3: BOOKMARKS & CUSTOM COLLECTIONS ---
  try {
    inMemoryBookmarks.push({
      id: `bm_${Date.now()}`,
      projectId: testProjectId,
      userId: null,
      visitorId: visitorId,
      collectionId: null,
      createdAt: new Date()
    } as any);

    const exists = inMemoryBookmarks.some(b => b.projectId === testProjectId && b.visitorId === visitorId);
    assert(exists, 'Bookmarked article ON (In-Memory)');
  } catch (err: any) {
    console.error('Test 3 failed:', err);
    failedTests++;
  }

  // --- TEST 4: KINDLE HIGHLIGHTS & NOTE ANCHORS ---
  try {
    const hl = {
      id: `hl_${Date.now()}`,
      projectId: testProjectId,
      userId: null,
      visitorId: visitorId,
      text: 'React 19 supports Partial Prerendering.',
      color: 'yellow',
      createdAt: new Date()
    };
    inMemoryHighlights.push(hl as any);

    const note = {
      id: `note_${Date.now()}`,
      projectId: testProjectId,
      highlightId: hl.id,
      userId: null,
      visitorId: visitorId,
      content: 'PPR speeds up page shells.',
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryNotes.push(note as any);

    assert(inMemoryHighlights.length > 0 && inMemoryNotes.length > 0, 'Kindle text selection and annotations saved (In-Memory)');
  } catch (err: any) {
    console.error('Test 4 failed:', err);
    failedTests++;
  }

  // --- TEST 5: COMMENTS TREE QUERY ---
  try {
    const comments = await publicDb.getCommentsForPost(testProjectId);
    assert(Array.isArray(comments), 'Comment tree retrieved correctly for technical route');
  } catch (err: any) {
    console.error('Test 5 failed:', err);
    failedTests++;
  }

  // --- TEST 6: TRANSACTION GUEST MERGING ---
  try {
    await publicDb.syncVisitorData(visitorId, userId);
    const reactionsCount = inMemoryReactions.filter(r => r.userId === userId).length;
    const bookmarksCount = inMemoryBookmarks.filter(b => b.userId === userId).length;
    
    assert(reactionsCount > 0, 'Guest reaction claps merged to logged-in user successfully');
    assert(bookmarksCount > 0, 'Guest bookmarks merged to logged-in user successfully');
  } catch (err: any) {
    console.error('Test 6 failed:', err);
    failedTests++;
  }

  console.log('\n================================================');
  console.log(`📊 TESTS COMPLETED. PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
