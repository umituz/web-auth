import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button, Input } from '@umituz/web-design-system/atoms';
import { cn } from '@umituz/web-design-system/utils/cn';
import { useAuthT } from '../utils/messages';
import type { Translate } from '../types/auth';
import { AuthErrorBanner } from './shared';

export interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  busy?: boolean;
  error?: string | null;
  userEmail?: string;
  requireConfirmationWord?: boolean;
  confirmationWord?: string;
  title?: string;
  warning?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  translate?: Translate;
  className?: string;
}

export const DeleteAccountDialog = ({
  isOpen,
  onClose,
  onConfirm,
  busy = false,
  error,
  userEmail,
  requireConfirmationWord = false,
  confirmationWord = 'DELETE',
  title,
  warning,
  description,
  confirmLabel,
  cancelLabel,
  translate,
  className,
}: DeleteAccountDialogProps) => {
  const defaultT = useAuthT();
  const t = translate ?? defaultT;

  const [confirmInput, setConfirmInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  const resolvedTitle = title ?? t('auth.deleteAccount.title');
  const resolvedWarning = warning ?? t('auth.deleteAccount.warning');
  const resolvedConfirmLabel = confirmLabel ?? t('auth.deleteAccount.confirmButton');
  const resolvedCancelLabel = cancelLabel ?? t('auth.deleteAccount.cancelButton');

  const targetWord = userEmail || confirmationWord;
  const isConfirmed = !requireConfirmationWord || confirmInput.trim() === targetWord.trim();

  const handleConfirm = async () => {
    if (!isConfirmed || busy) return;
    await onConfirm();
  };

  return (
    <div
      className="uauth-dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className={cn('uauth-dialog', className)}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="uauth-delete-title"
        aria-describedby="uauth-delete-desc"
      >
        <div className="uauth-dialog__header">
          <div className="uauth-dialog__icon-wrap">
            <AlertTriangle className="uauth-dialog__icon" aria-hidden="true" />
          </div>
          <h2 id="uauth-delete-title" className="uauth-dialog__title">
            {resolvedTitle}
          </h2>
        </div>

        <div className="uauth-dialog__body" id="uauth-delete-desc">
          {error && <AuthErrorBanner message={error} translate={t} />}

          {description && (
            <p className="uauth-dialog__desc">{description}</p>
          )}

          <div className="uauth-dialog__warning">
            <p>{resolvedWarning}</p>
          </div>

          {requireConfirmationWord && (
            <div className="uauth-field" style={{ marginTop: '12px' }}>
              <label className="uauth-field__label" htmlFor="uauth-delete-confirm-word">
                {t('auth.deleteAccount.confirmPrompt', { word: targetWord })}
              </label>
              <Input
                id="uauth-delete-confirm-word"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                disabled={busy}
                placeholder={targetWord}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="uauth-dialog__footer">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={busy}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || busy}
          >
            {busy ? (
              <>
                <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
                <span>{t('auth.deleteAccount.deleting')}</span>
              </>
            ) : (
              resolvedConfirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
