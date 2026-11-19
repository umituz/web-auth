import { describe, expect, it } from 'vitest';
import {
  buildUserDataExport,
  detectSuspiciousLogin,
  sanitizeSensitiveData,
  validateAgeEligibility,
} from './securityAudit';

describe('detectSuspiciousLogin', () => {
  const previous = [
    { ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 Mac Chrome/120' },
    { ipAddress: '192.168.1.11', userAgent: 'Mozilla/5.0 Mac Chrome/120' },
  ];

  it('reports none for empty previous history', () => {
    const res = detectSuspiciousLogin({ ipAddress: '10.0.0.1' }, []);
    expect(res.isSuspicious).toBe(false);
    expect(res.riskLevel).toBe('none');
  });

  it('reports none for known IP and UA', () => {
    const res = detectSuspiciousLogin(
      { ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 Mac Chrome/120' },
      previous,
    );
    expect(res.isSuspicious).toBe(false);
    expect(res.riskLevel).toBe('none');
  });

  it('reports new_device for known IP but new UA', () => {
    const res = detectSuspiciousLogin(
      { ipAddress: '192.168.1.10', userAgent: 'iPhone Safari/17' },
      previous,
    );
    expect(res.isSuspicious).toBe(false);
    expect(res.riskLevel).toBe('new_device');
  });

  it('reports new_ip for unknown IP with known UA', () => {
    const res = detectSuspiciousLogin(
      { ipAddress: '88.200.50.1', userAgent: 'Mozilla/5.0 Mac Chrome/120' },
      previous,
    );
    expect(res.isSuspicious).toBe(true);
    expect(res.riskLevel).toBe('new_ip');
  });

  it('reports high_risk for unknown IP and unknown UA', () => {
    const res = detectSuspiciousLogin(
      { ipAddress: '88.200.50.1', userAgent: 'Android Linux Browser' },
      previous,
    );
    expect(res.isSuspicious).toBe(true);
    expect(res.riskLevel).toBe('high_risk');
    expect(res.reasons).toContain('unrecognized_ip_address');
    expect(res.reasons).toContain('unrecognized_device_user_agent');
  });
});

describe('sanitizeSensitiveData', () => {
  it('masks passwords, secrets, tokens, and cookies while preserving non-sensitive data', () => {
    const input = {
      user: {
        id: 'u-1',
        email: 'test@example.com',
        password: 'superSecretPassword123',
        nested: {
          refreshToken: 'xyz-refresh-token',
          normalField: 'hello',
        },
      },
      apiKey: 'secret-key-99',
      cookie: 'session=123',
      scores: [1, 2, 3],
    };

    const sanitized = sanitizeSensitiveData(input);
    expect(sanitized.user.id).toBe('u-1');
    expect(sanitized.user.email).toBe('test@example.com');
    expect(sanitized.user.password).toBe('[REDACTED]');
    expect(sanitized.user.nested.refreshToken).toBe('[REDACTED]');
    expect(sanitized.user.nested.normalField).toBe('hello');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.cookie).toBe('[REDACTED]');
    expect(sanitized.scores).toEqual([1, 2, 3]);

    expect(input.user.password).toBe('superSecretPassword123');
  });
});

describe('validateAgeEligibility', () => {
  const ref = new Date('2026-11-19T00:00:00Z');

  it('accepts age >= 13', () => {
    expect(validateAgeEligibility(15, 13, ref).eligible).toBe(true);
    expect(validateAgeEligibility('2010-01-01', 13, ref).eligible).toBe(true);
  });

  it('rejects age < 13', () => {
    const res = validateAgeEligibility(11, 13, ref);
    expect(res.eligible).toBe(false);
    expect(res.error).toBe('underage');

    const resDate = validateAgeEligibility('2018-05-10', 13, ref);
    expect(resDate.eligible).toBe(false);
    expect(resDate.error).toBe('underage');
  });

  it('rejects invalid dates or ages', () => {
    expect(validateAgeEligibility('not-a-date', 13, ref).eligible).toBe(false);
    expect(validateAgeEligibility(-5, 13, ref).eligible).toBe(false);
  });
});

describe('buildUserDataExport', () => {
  it('builds a GDPR Art. 20 export envelope with sanitized fields', () => {
    const ref = new Date('2026-11-19T12:00:00Z');
    const exported = buildUserDataExport(
      'u-123',
      {
        profile: { name: 'Ali', email: 'ali@example.com', password: 'secretPassword' },
        records: [10, 20],
      },
      ref,
    );

    expect(exported.schemaVersion).toBe('1.0');
    expect(exported.dataSubjectId).toBe('u-123');
    expect(exported.exportedAt).toBe('2026-11-19T12:00:00.000Z');
    expect(exported.data.profile.name).toBe('Ali');
    expect(exported.data.profile.password).toBe('[REDACTED]');
  });
});
