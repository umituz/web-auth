import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookieBanner } from './CookieBanner';
import { getStoredCookiePreferences } from '../utils/cookieConsent';

describe('CookieBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders when no preferences are stored and accepts all', () => {
    const onConsentChange = vi.fn();
    render(<CookieBanner onConsentChange={onConsentChange} />);

    expect(screen.getByRole('region')).toBeTruthy();

    const acceptBtn = screen.getByRole('button', { name: /accept all|tümünü kabul/i });
    fireEvent.click(acceptBtn);

    expect(onConsentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        essential: true,
        analytics: true,
        marketing: true,
      }),
    );

    const stored = getStoredCookiePreferences();
    expect(stored?.analytics).toBe(true);
    expect(stored?.marketing).toBe(true);
  });

  it('rejects non-essential cookies', () => {
    const onConsentChange = vi.fn();
    render(<CookieBanner onConsentChange={onConsentChange} />);

    const rejectBtn = screen.getByRole('button', { name: /essential only|reject all|yalnızca zorunlular/i });
    fireEvent.click(rejectBtn);

    expect(onConsentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        essential: true,
        analytics: false,
        marketing: false,
      }),
    );

    const stored = getStoredCookiePreferences();
    expect(stored?.analytics).toBe(false);
    expect(stored?.marketing).toBe(false);
  });

  it('does not render if preferences are already saved unless forced', () => {
    window.localStorage.setItem(
      'cookie_consent_preferences',
      JSON.stringify({ essential: true, analytics: false, marketing: false, updatedAt: 1234 }),
    );

    const { rerender } = render(<CookieBanner />);
    expect(screen.queryByRole('region')).toBeNull();

    rerender(<CookieBanner forceVisible={true} />);
    expect(screen.getByRole('region')).toBeTruthy();
  });
});
