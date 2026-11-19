import { useState, useEffect } from 'react';
import { Button } from '@umituz/web-design-system/atoms';
import { cn } from '@umituz/web-design-system/utils/cn';
import { useAuthT } from '../utils/messages';
import type { Translate } from '../types/auth';
import {
  type CookiePreferences,
  getStoredCookiePreferences,
  saveCookiePreferences,
} from '../utils/cookieConsent';

export interface CookieBannerProps {
  onConsentChange?: (preferences: CookiePreferences) => void;
  storageKey?: string;
  privacyUrl?: string;
  forceVisible?: boolean;
  translate?: Translate;
  className?: string;
}

export const CookieBanner = ({
  onConsentChange,
  storageKey,
  privacyUrl = '/privacy',
  forceVisible = false,
  translate,
  className,
}: CookieBannerProps) => {
  const contextT = useAuthT();
  const t = translate ?? contextT;
  const [visible, setVisible] = useState(forceVisible);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (forceVisible) {
      setVisible(true);
      return;
    }
    const stored = getStoredCookiePreferences(storageKey);
    if (!stored) {
      setVisible(true);
    } else {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
    }
  }, [forceVisible, storageKey]);

  if (!visible) return null;

  const handleAcceptAll = () => {
    const prefs = saveCookiePreferences({ analytics: true, marketing: true }, storageKey);
    onConsentChange?.(prefs);
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    const prefs = saveCookiePreferences({ analytics: false, marketing: false }, storageKey);
    onConsentChange?.(prefs);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const prefs = saveCookiePreferences({ analytics, marketing }, storageKey);
    onConsentChange?.(prefs);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:p-6',
        className,
      )}
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              {t('auth.cookies.title')}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t('auth.cookies.description')}{' '}
              {privacyUrl && (
                <a
                  href={privacyUrl}
                  className="text-[var(--color-primary)] underline hover:opacity-80"
                >
                  {t('auth.cookies.privacyLink')}
                </a>
              )}
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {t('auth.cookies.essentialTitle')}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t('auth.cookies.essentialDesc')}
                </p>
              </div>
              <span className="rounded bg-[var(--color-surface)] px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {t('auth.cookies.alwaysActive')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {t('auth.cookies.analyticsTitle')}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t('auth.cookies.analyticsDesc')}
                </p>
              </div>
              <input
                type="checkbox"
                aria-label={t('auth.cookies.analyticsTitle')}
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {t('auth.cookies.marketingTitle')}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t('auth.cookies.marketingDesc')}
                </p>
              </div>
              <input
                type="checkbox"
                aria-label={t('auth.cookies.marketingTitle')}
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--color-primary)]"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails
              ? t('auth.cookies.hideDetails')
              : t('auth.cookies.customize')}
          </Button>

          {showDetails ? (
            <Button variant="primary" size="sm" onClick={handleSaveCustom}>
              {t('auth.cookies.savePreferences')}
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={handleRejectNonEssential}>
                {t('auth.cookies.rejectAll')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                {t('auth.cookies.acceptAll')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
