import { getPrisma } from '@/lib/database/dbClient';
import { sendEmail } from './mailer';

/**
 * Enqueues an email job in the database and triggers async processing
 */
export async function enqueueEmail(to: string, subject: string, html: string, text: string) {
  const prisma = getPrisma();
  if (prisma) {
    const job = await prisma.emailJob.create({
      data: { to, subject, html, text }
    });

    // Asynchronously trigger worker execution (fire-and-forget)
    processEmailQueue().catch(err => {
      console.error('[Async Email worker trigger error]:', err);
    });

    return job;
  } else {
    // Sandbox Fallback
    return await sendEmail({ to, subject, html, text });
  }
}

/**
 * Worker process picking up pending/failed jobs with attempts < 3
 */
export async function processEmailQueue() {
  const prisma = getPrisma();
  if (!prisma) return { processedCount: 0, logs: ['No database client adapter loaded.'] };

  const logs: string[] = [];
  
  // Retrieve up to 5 jobs
  const jobs = await prisma.emailJob.findMany({
    where: {
      status: { in: ['pending', 'failed'] },
      attempts: { lt: 3 }
    },
    take: 5,
    orderBy: { createdAt: 'asc' }
  });

  let processedCount = 0;

  for (const job of jobs) {
    processedCount++;
    try {
      // Mark as sending to lock job
      await prisma.emailJob.update({
        where: { id: job.id },
        data: { status: 'sending', attempts: { increment: 1 } }
      });

      const res = await sendEmail({
        to: job.to,
        subject: job.subject,
        html: job.html,
        text: job.text
      });

      if (res.success) {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'completed', processedAt: new Date() }
        });
        logs.push(`Email job ${job.id} completed successfully to ${job.to}`);
      } else {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'failed', lastError: res.error || 'SMTP delivery failure' }
        });
        logs.push(`Email job ${job.id} failed delivery: ${res.error}`);
      }
    } catch (err: any) {
      await prisma.emailJob.update({
        where: { id: job.id },
        data: { status: 'failed', lastError: err.message || 'Unknown processing error' }
      });
      logs.push(`Email job ${job.id} crashed with error: ${err.message}`);
    }
  }

  return { processedCount, logs };
}
