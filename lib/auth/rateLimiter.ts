import { checkRateLimit } from '../security/rateLimiter';

export type RateLimitType = 
  | 'login' 
  | 'signup' 
  | 'forgot' 
  | 'reset' 
  | 'verify' 
  | 'profile' 
  | 'username' 
  | 'publish' 
  | 'comment';

/**
 * Checks a rate limit with thresholds scaled dynamically by user role
 */
export async function checkRoleRateLimit(
  key: string,
  type: RateLimitType,
  role: string = 'guest'
): Promise<{ success: boolean; timeLeft: number }> {
  let limit = 10;
  let windowSeconds = 900; // 15 mins default

  switch (type) {
    case 'login':
      limit = 5;
      windowSeconds = 900; // 5 attempts per 15 minutes
      break;
    case 'signup':
      limit = 5;
      windowSeconds = 3600; // 5 signups per hour
      break;
    case 'forgot':
    case 'reset':
      limit = 3;
      windowSeconds = 3600; // 3 requests per hour
      break;
    case 'verify':
      limit = 3;
      windowSeconds = 3600; // 3 resends per hour
      break;
    case 'username':
      limit = 20;
      windowSeconds = 900; // 20 attempts per 15 minutes
      break;
    case 'profile':
      limit = 10;
      windowSeconds = 900; // 10 updates per 15 minutes
      break;
    case 'comment':
      limit = 15;
      windowSeconds = 900; // 15 comments per 15 minutes
      break;
    case 'publish':
      if (role === 'admin') {
        return { success: true, timeLeft: 0 };
      } else if (role === 'moderator') {
        limit = 50;
        windowSeconds = 3600;
      } else if (role === 'creator' || role === 'verified_creator') {
        limit = 30;
        windowSeconds = 3600;
      } else if (role === 'user') {
        limit = 5;
        windowSeconds = 3600;
      } else {
        // Guests cannot publish
        return { success: false, timeLeft: -1 };
      }
      break;
  }

  // Adjust standard limits for administrative roles
  if (role === 'admin') {
    limit = limit * 10;
  } else if (role === 'moderator') {
    limit = limit * 5;
  }

  return await checkRateLimit(key, limit, windowSeconds);
}
