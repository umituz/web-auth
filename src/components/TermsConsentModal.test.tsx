import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TermsConsentModal } from './TermsConsentModal';

describe('TermsConsentModal', () => {
  it('does not render when isOpen is false', () => {
    render(<TermsConsentModal isOpen={false} termsVersion="2026.11" onConfirm={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('requires mandatory checkboxes before submission', async () => {
    const onConfirm = vi.fn();
    render(<TermsConsentModal isOpen={true} termsVersion="2026.11" onConfirm={onConfirm} />);

    expect(screen.getByRole('dialog')).toBeTruthy();

    const termsCheckbox = screen.getByLabelText('Kullanım Koşulları Onayı');
    const kvkkCheckbox = screen.getByLabelText('KVKK ve Gizlilik Onayı');
    const marketingCheckbox = screen.getByLabelText('Pazarlama İletişimi Onayı');
    const submitBtn = screen.getByRole('button', { name: /accept and continue|confirm|onayla/i }) as HTMLButtonElement;

    expect(submitBtn.disabled).toBe(true);

    fireEvent.click(termsCheckbox);
    expect(submitBtn.disabled).toBe(true);

    fireEvent.click(kvkkCheckbox);
    expect(submitBtn.disabled).toBe(false);

    fireEvent.click(marketingCheckbox);
    fireEvent.click(submitBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      termsAccepted: true,
      kvkkAccepted: true,
      marketingAccepted: true,
      version: '2026.11',
    });
  });

  it('surfaces an error and re-enables the dialog when onConfirm rejects', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('boom'));
    render(<TermsConsentModal isOpen={true} termsVersion="2026.11" onConfirm={onConfirm} />);

    fireEvent.click(screen.getByLabelText('Kullanım Koşulları Onayı'));
    fireEvent.click(screen.getByLabelText('KVKK ve Gizlilik Onayı'));
    const submitBtn = screen.getByRole('button', { name: /accept and continue|confirm|onayla/i }) as HTMLButtonElement;
    fireEvent.click(submitBtn);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('We could not save your consent');
    expect(submitBtn.disabled).toBe(false);
  });
});
