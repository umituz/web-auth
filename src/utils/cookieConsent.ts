export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: number;
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: 0,
};

export const COOKIE_CONSENT_STORAGE_KEY = 'cookie_consent_preferences';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function resolveStorage(custom?: StorageLike): StorageLike | null {
  if (custom) return custom;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function getStoredCookiePreferences(
  storageKey = COOKIE_CONSENT_STORAGE_KEY,
  storage?: StorageLike,
): CookiePreferences | null {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveCookiePreferences(
  preferences: { analytics: boolean; marketing: boolean },
  storageKey = COOKIE_CONSENT_STORAGE_KEY,
  now = Date.now(),
  storage?: StorageLike,
): CookiePreferences {
  const result: CookiePreferences = {
    essential: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    updatedAt: now,
  };
  const store = resolveStorage(storage);
  if (store) {
    try {
      store.setItem(storageKey, JSON.stringify(result));
    } catch {
      // storage unavailable
    }
  }
  return result;
}

export function hasUserGivenCookieConsent(
  storageKey = COOKIE_CONSENT_STORAGE_KEY,
  storage?: StorageLike,
): boolean {
  return getStoredCookiePreferences(storageKey, storage) !== null;
}
