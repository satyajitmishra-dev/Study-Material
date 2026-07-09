import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { automationDb } from '@/lib/database/automationDb';
import { pushToQueue } from '@/lib/automation/eventQueue';

/**
 * Validates HMAC SHA-256 GitHub Webhook signature
 */
function verifySignature(signature: string, bodyText: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(bodyText).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (err) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const headers = req.headers;

    const eventType = headers.get('x-github-event') || 'push';
    const signature256 = headers.get('x-hub-signature-256') || '';
    const deliveryId = headers.get('x-github-delivery') || `dev_${Date.now()}`;

    const payload = JSON.parse(bodyText);
    const repoFullName = payload.repository?.full_name; // e.g. "owner/name"
    if (!repoFullName) {
      return NextResponse.json({ error: 'Missing repository details in payload' }, { status: 400 });
    }

    const [owner, name] = repoFullName.split('/');

    // 1. Fetch Repository Config
    const repo = await automationDb.getRepositoryByFullName(owner, name);
    if (!repo) {
      return NextResponse.json({ error: `Repository ${repoFullName} not connected` }, { status: 404 });
    }

    // 2. Validate Webhook Signature
    if (repo.webhookSecret) {
      if (!signature256) {
        return NextResponse.json({ error: 'Webhook signature header missing' }, { status: 401 });
      }
      const isValid = verifySignature(signature256, bodyText, repo.webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    } else {
      // Print warning in dev
      console.warn(`[Webhook Ingest] Received event for repo ${repoFullName} without webhookSecret verification.`);
    }

    // 3. Extract Trigger details
    let sha: string | null = null;
    let author: string | null = null;
    let message: string | null = null;
    let ref: string | null = null;
    let action: string | null = null;

    if (eventType === 'push') {
      ref = payload.ref;
      sha = payload.after;
      const headCommit = payload.head_commit;
      if (headCommit) {
        message = headCommit.message;
        author = headCommit.author?.username || headCommit.author?.name;
      }
    } else if (eventType === 'pull_request') {
      action = payload.action;
      ref = payload.pull_request?.head?.ref;
      sha = payload.pull_request?.head?.sha;
      author = payload.pull_request?.user?.login;
      message = payload.pull_request?.title;
    } else if (eventType === 'release') {
      action = payload.action;
      ref = payload.release?.tag_name;
      sha = payload.release?.tag_name;
      author = payload.release?.author?.login;
      message = payload.release?.name || payload.release?.body;
    }

    // 4. Push to Asynchronous DB Queue
    const result = await pushToQueue({
      owner,
      name,
      idempotencyKey: deliveryId,
      eventType,
      action,
      ref,
      sha,
      author,
      message,
      payload: bodyText,
    });

    if (result.status === 'duplicate') {
      return NextResponse.json({ message: 'Duplicate event filtered', eventId: result.eventId }, { status: 200 });
    }

    if (result.status === 'ignored') {
      return NextResponse.json({ message: 'Event ignored by settings', error: result.error }, { status: 202 });
    }

    return NextResponse.json({ message: 'Webhook event enqueued successfully', eventId: result.eventId }, { status: 202 });
  } catch (err: any) {
    console.error('[Webhook Ingestion Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
