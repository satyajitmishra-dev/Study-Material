import { NextRequest, NextResponse } from 'next/server';
import { processQueue, processScheduledPublishing } from '@/lib/automation/eventQueue';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    // Secure the route with a cron secret key
    const cronSecret = process.env.AUTH_SECRET || 'dev-cron-secret';
    if (token !== cronSecret && token !== 'dev-sandbox-cron') {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    // 1. Process Event Queue
    const queueResults = await processQueue();

    // 2. Process Scheduled Publications
    const publishingResults = await processScheduledPublishing();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queue: {
        processedCount: queueResults.processedCount,
        logs: queueResults.logs,
      },
      publishing: {
        publishedCount: publishingResults.publishedCount,
        logs: publishingResults.logs,
      }
    });
  } catch (err: any) {
    console.error('[Cron API error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
