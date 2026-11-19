import { describe, expect, it } from 'vitest';
import { createBruteForceGuard, createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows requests up to the maxAttempts limit within window', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxAttempts: 3 });
    const t0 = 1000;

    const res1 = limiter.consume('user-1', t0);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.consume('user-1', t0 + 100);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.consume('user-1', t0 + 200);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    const res4 = limiter.consume('user-1', t0 + 300);
    expect(res4.allowed).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets window after elapsed time', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxAttempts: 2 });
    const t0 = 1000;

    limiter.consume('user-2', t0);
    limiter.consume('user-2', t0 + 100);
    expect(limiter.consume('user-2', t0 + 200).allowed).toBe(false);

    const resAfterWindow = limiter.consume('user-2', t0 + 1100);
    expect(resAfterWindow.allowed).toBe(true);
  });

  it('resets manually via reset()', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxAttempts: 1 });
    limiter.consume('user-3', 1000);
    expect(limiter.peek('user-3', 1100).allowed).toBe(false);
    limiter.reset('user-3');
    expect(limiter.peek('user-3', 1100).allowed).toBe(true);
  });
});

describe('createBruteForceGuard', () => {
  it('locks out after reaching max failed attempts', () => {
    const guard = createBruteForceGuard({ maxFailedAttempts: 3, lockoutDurationMs: 60000 });
    const t0 = 1000;

    const r1 = guard.recordFailure('attacker', t0);
    expect(r1.locked).toBe(false);
    expect(r1.remainingAttempts).toBe(2);

    const r2 = guard.recordFailure('attacker', t0 + 100);
    expect(r2.locked).toBe(false);
    expect(r2.remainingAttempts).toBe(1);

    const r3 = guard.recordFailure('attacker', t0 + 200);
    expect(r3.locked).toBe(true);
    expect(r3.remainingAttempts).toBe(0);
    expect(r3.lockoutUntil).toBe(t0 + 200 + 60000);
    expect(r3.retryAfterSeconds).toBe(60);

    const r4 = guard.check('attacker', t0 + 300);
    expect(r4.locked).toBe(true);

    const r5 = guard.check('attacker', t0 + 70000);
    expect(r5.locked).toBe(false);
    expect(r5.remainingAttempts).toBe(3);
  });

  it('clears failures on recordSuccess', () => {
    const guard = createBruteForceGuard({ maxFailedAttempts: 3, lockoutDurationMs: 60000 });
    guard.recordFailure('user', 1000);
    guard.recordFailure('user', 1100);
    expect(guard.check('user', 1200).remainingAttempts).toBe(1);
    guard.recordSuccess('user');
    expect(guard.check('user', 1200).remainingAttempts).toBe(3);
  });
});
