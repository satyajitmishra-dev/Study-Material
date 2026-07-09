// In-memory sliding window rate limiter
const trackers = new Map<string, number[]>();

// Clean up old rates every minute to prevent leaks
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of trackers.entries()) {
      const filtered = timestamps.filter(t => now - t < 60000);
      if (filtered.length === 0) {
        trackers.delete(key);
      } else {
        trackers.set(key, filtered);
      }
    }
  }, 60000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(key: string, limit: number = 30, windowMs: number = 60000): RateLimitResult {
  const now = Date.now();
  const userTimestamps = trackers.get(key) || [];
  
  // Filter out timestamps outside the sliding window
  const activeTimestamps = userTimestamps.filter(t => now - t < windowMs);
  
  if (activeTimestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(0, windowMs - (now - activeTimestamps[0])),
    };
  }
  
  activeTimestamps.push(now);
  trackers.set(key, activeTimestamps);
  
  return {
    success: true,
    limit,
    remaining: limit - activeTimestamps.length,
    reset: windowMs,
  };
}
