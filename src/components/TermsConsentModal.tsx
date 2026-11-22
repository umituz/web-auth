import { useState } from 'react';
import { Button } from '@umituz/web-design-system/atoms';
import { cn } from '@umituz/web-design-system/utils/cn';
import { useAuthT } from '../utils/messages';
import type { Translate } from '../types/auth';
import { AuthErrorBanner } from './shared/AuthErrorBanner';

export interface ConsentPayload {
  termsAccepted: boolean;
  kvkkAccepted: boolean;
  marketingAccepted: boolean;
  version: string;
}

export interface TermsConsentModalProps {
  isOpen: boolean;
  termsVersion: string;
  onConfirm: (payload: ConsentPayload) => Promise<void> | void;
  onCancel?: () => void;
  busy?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  translate?: Translate;
  className?: string;
}

export const TermsConsentModal = ({
  isOpen,
  termsVersion,
  onConfirm,
  onCancel,
  busy = false,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  translate,
  className,
}: TermsConsentModalProps) => {
  const contextT = useAuthT();
  const t = translate ?? contextT;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!isOpen) return null;

  const canSubmit = termsAccepted && kvkkAccepted && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFailed(false);
    try {
      await onConfirm({
        termsAccepted,
        kvkkAccepted,
        marketingAccepted,
        version: termsVersion,
      });
    } catch {
      setFailed(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl',
          className,
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <h2
              id="terms-consent-title"
              className="text-lg font-bold text-[var(--color-text)]"
            >
              {t('auth.consent.title')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t('auth.consent.intro')}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 text-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                aria-label="Kullanım Koşulları Onayı"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-[var(--color-text)]">
                <a
                  href={termsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--color-primary)] underline hover:opacity-80"
                >
                  {t('auth.consent.termsLink')}
                </a>
                {' '}{t('auth.consent.mandatorySuffix')}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                aria-label="KVKK ve Gizlilik Onayı"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-[var(--color-text)]">
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--color-primary)] underline hover:opacity-80"
                >
                  {t('auth.consent.privacyLink')}
                </a>
                {' '}{t('auth.consent.mandatorySuffix')}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                aria-label="Pazarlama İletişimi Onayı"
                checked={marketingAccepted}
                onChange={(e) => setMarketingAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-[var(--color-text-secondary)]">
                {t('auth.consent.marketing')}
              </span>
            </label>
          </div>

          {failed && <AuthErrorBanner message="auth.consent.error" translate={t} />}

          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                {t('auth.consent.cancel')}
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {t('auth.consent.confirm')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
