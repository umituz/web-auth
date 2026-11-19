export interface RateLimitOptions {
  windowMs: number;
  maxAttempts: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  consume(key: string, now?: number): RateLimitResult;
  peek(key: string, now?: number): RateLimitResult;
  reset(key: string): void;
}

export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const { windowMs, maxAttempts } = options;
  const hits = new Map<string, number[]>();

  function prune(timestamps: number[], cutoff: number): number[] {
    return timestamps.filter((t) => t > cutoff);
  }

  function getTimestamps(key: string, now: number): number[] {
    const existing = hits.get(key);
    if (!existing) return [];
    const pruned = prune(existing, now - windowMs);
    if (pruned.length === 0) {
      hits.delete(key);
      return [];
    }
    hits.set(key, pruned);
    return pruned;
  }

  return {
    consume(key: string, now: number = Date.now()): RateLimitResult {
      const active = getTimestamps(key, now);
      if (active.length >= maxAttempts) {
        const oldest = active[0] ?? now;
        const resetAt = oldest + windowMs;
        const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfterSeconds,
        };
      }

      active.push(now);
      hits.set(key, active);
      const resetAt = active[0]! + windowMs;
      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts - active.length),
        resetAt,
        retryAfterSeconds: 0,
      };
    },

    peek(key: string, now: number = Date.now()): RateLimitResult {
      const active = getTimestamps(key, now);
      const remaining = Math.max(0, maxAttempts - active.length);
      const oldest = active[0] ?? now;
      const resetAt = active.length > 0 ? oldest + windowMs : now + windowMs;
      const retryAfterSeconds = active.length >= maxAttempts ? Math.max(1, Math.ceil((resetAt - now) / 1000)) : 0;
      return {
        allowed: active.length < maxAttempts,
        remaining,
        resetAt,
        retryAfterSeconds,
      };
    },

    reset(key: string): void {
      hits.delete(key);
    },
  };
}

export interface BruteForceOptions {
  maxFailedAttempts: number;
  lockoutDurationMs: number;
}

export interface BruteForceResult {
  locked: boolean;
  remainingAttempts: number;
  lockoutUntil?: number;
  retryAfterSeconds: number;
}

export interface BruteForceGuard {
  recordFailure(key: string, now?: number): BruteForceResult;
  recordSuccess(key: string): void;
  check(key: string, now?: number): BruteForceResult;
}

export function createBruteForceGuard(options: BruteForceOptions): BruteForceGuard {
  const { maxFailedAttempts, lockoutDurationMs } = options;
  const attempts = new Map<string, { count: number; lockedUntil?: number }>();

  return {
    check(key: string, now: number = Date.now()): BruteForceResult {
      const entry = attempts.get(key);
      if (!entry) {
        return {
          locked: false,
          remainingAttempts: maxFailedAttempts,
          retryAfterSeconds: 0,
        };
      }

      if (entry.lockedUntil && entry.lockedUntil > now) {
        const retryAfterSeconds = Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000));
        return {
          locked: true,
          remainingAttempts: 0,
          lockoutUntil: entry.lockedUntil,
          retryAfterSeconds,
        };
      }

      if (entry.lockedUntil && entry.lockedUntil <= now) {
        attempts.delete(key);
        return {
          locked: false,
          remainingAttempts: maxFailedAttempts,
          retryAfterSeconds: 0,
        };
      }

      return {
        locked: false,
        remainingAttempts: Math.max(0, maxFailedAttempts - entry.count),
        retryAfterSeconds: 0,
      };
    },

    recordFailure(key: string, now: number = Date.now()): BruteForceResult {
      const current = this.check(key, now);
      if (current.locked) return current;

      const entry = attempts.get(key) ?? { count: 0 };
      entry.count += 1;

      if (entry.count >= maxFailedAttempts) {
        const lockedUntil = now + lockoutDurationMs;
        entry.lockedUntil = lockedUntil;
        attempts.set(key, entry);
        return {
          locked: true,
          remainingAttempts: 0,
          lockoutUntil: lockedUntil,
          retryAfterSeconds: Math.ceil(lockoutDurationMs / 1000),
        };
      }

      attempts.set(key, entry);
      return {
        locked: false,
        remainingAttempts: maxFailedAttempts - entry.count,
        retryAfterSeconds: 0,
      };
    },

    recordSuccess(key: string): void {
      attempts.delete(key);
    },
  };
}
