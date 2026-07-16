import { getPrisma } from '@/lib/database/dbClient';

const disposableDomains = [
  'mailinator.com', 'yopmail.com', 'tempmail.com', 'sharklasers.com',
  'guerrillamail.com', 'dispostable.com', 'getairmail.com', '10minutemail.com'
];

/**
 * Checks if the email address belongs to a disposable domain
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return disposableDomains.includes(domain);
}

/**
 * Validates critical environment settings. Fails fast in production.
 */
export function validateAuthConfig() {
  // Skip secret validation checks during static compile/build phase
  if (process.env.NEXT_PHASE && process.env.NEXT_PHASE.includes('build')) {
    return;
  }

  const required = ['AUTH_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const msg = `FATAL: Missing critical configuration keys: ${missing.join(', ')}`;
    console.error(msg);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
  }

  // Require SMTP configuration in production
  if (process.env.NODE_ENV === 'production') {
    const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
    const missingSmtp = smtpKeys.filter(key => !process.env[key]);
    if (missingSmtp.length > 0) {
      throw new Error(`FATAL: Missing production SMTP config: ${missingSmtp.join(', ')}`);
    }
  }
}

/**
 * Compares login parameters with session logs to catch browser changes or impossible travel
 */
export async function detectSuspiciousLogin(
  userId: string,
  currentIp: string,
  currentUa: string,
  currentBrowser: string,
  currentOs: string,
  currentLocation: string
): Promise<{ suspicious: boolean; reason?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { suspicious: false };

  // Fetch the user's most recent active session
  const previous = await prisma.userSession.findMany({
    where: { userId },
    orderBy: { lastActiveAt: 'desc' },
    take: 1
  });

  if (previous.length === 0) return { suspicious: false }; // First session is not flagged

  const prev = previous[0];
  const prevLocation = prev.location || 'Localhost';
  const prevActive = prev.lastActiveAt;

  // 1. Impossible travel check (location mismatch within short window)
  if (prevLocation !== 'Localhost' && currentLocation !== 'Localhost' && prevLocation !== currentLocation) {
    const timeDiffHours = (Date.now() - prevActive.getTime()) / (1000 * 60 * 60);
    if (timeDiffHours < 4) {
      return {
        suspicious: true,
        reason: `Impossible Travel: Location changed from '${prevLocation}' to '${currentLocation}' within ${timeDiffHours.toFixed(1)} hours.`
      };
    }
  }

  // 2. Double delta check (both browser and OS changed in consecutive logins)
  const prevOs = prev.os || '';
  const prevBrowser = prev.browser || '';

  if (prevOs && prevBrowser && prevOs !== currentOs && prevBrowser !== currentBrowser) {
    return {
      suspicious: true,
      reason: `New environment profile: Browser '${currentBrowser}' and OS '${currentOs}' (previously '${prevBrowser}' on '${prevOs}').`
    };
  }

  return { suspicious: false };
}
