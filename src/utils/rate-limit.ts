// utils/rate-limit.ts
const ipCounts = new Map<string, { count: number; expiry: number }>();

interface RateLimitOptions {
  ip: string;
  limit: number;
  windowMs: number;
}

export async function rateLimit(options: RateLimitOptions): Promise<void> {
  const { ip, limit, windowMs } = options;


  const now = Date.now();

  const ipData = ipCounts.get(ip) || { count: 0, expiry: now + windowMs };

  if (ipData.expiry < now) {
    ipCounts.set(ip, { count: 1, expiry: now + windowMs });
  } else if (ipData.count < limit) {
    ipData.count++;
    ipCounts.set(ip, ipData);
  } else {
    throw new Error("Rate limit exceeded");
  }

}
