import { describe, expect, it } from 'vitest';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  getStoredCookiePreferences,
  hasUserGivenCookieConsent,
  saveCookiePreferences,
  type StorageLike,
} from './cookieConsent';

function createMockStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => map.set(k, v),
  };
}

describe('cookieConsent utils', () => {
  it('returns null and false when no preferences have been stored', () => {
    const storage = createMockStorage();
    expect(getStoredCookiePreferences(COOKIE_CONSENT_STORAGE_KEY, storage)).toBeNull();
    expect(hasUserGivenCookieConsent(COOKIE_CONSENT_STORAGE_KEY, storage)).toBe(false);
  });

  it('saves and reads cookie preferences with mandatory essential=true', () => {
    const storage = createMockStorage();
    const saved = saveCookiePreferences({ analytics: true, marketing: false }, COOKIE_CONSENT_STORAGE_KEY, 12345, storage);
    expect(saved.essential).toBe(true);
    expect(saved.analytics).toBe(true);
    expect(saved.marketing).toBe(false);
    expect(saved.updatedAt).toBe(12345);

    const stored = getStoredCookiePreferences(COOKIE_CONSENT_STORAGE_KEY, storage);
    expect(stored).not.toBeNull();
    expect(stored?.analytics).toBe(true);
    expect(stored?.marketing).toBe(false);
    expect(hasUserGivenCookieConsent(COOKIE_CONSENT_STORAGE_KEY, storage)).toBe(true);
  });
});
