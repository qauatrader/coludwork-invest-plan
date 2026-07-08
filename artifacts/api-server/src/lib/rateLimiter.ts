import { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function makeLimiter(windowMs: number, maxAttempts: number) {
  return function limiter(req: Request, res: Response, next: NextFunction): void {
    const key = `${req.ip}:${req.body?.phone ?? ""}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= maxAttempts) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({ error: "Too many attempts. Please try again later." });
      return;
    }

    bucket.count += 1;
    next();
  };
}

// 10 attempts per 15 minutes per (ip, phone) pair
export const loginRateLimiter = makeLimiter(15 * 60 * 1000, 10);

// Periodically clean up expired buckets to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 10 * 60 * 1000);
