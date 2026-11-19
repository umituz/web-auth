import { useState } from 'react';
import { Button } from '@umituz/web-design-system/atoms';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@umituz/web-design-system/utils/cn';
import { useAuthT } from '../utils/messages';
import { authErrorMessage } from '../utils/errors';
import { validateChangePassword } from '../utils/passwordRules';
import type { AuthConfig, Translate } from '../types/auth';
import {
  AuthErrorBanner,
  PasswordInput,
  PasswordRequirements,
  PasswordStrengthIndicator,
} from './shared';

export interface ChangePasswordFormProps {
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  config?: AuthConfig;
  requireCurrentPassword?: boolean;
  minPasswordLength?: number;
  showRequirements?: boolean;
  showStrengthIndicator?: boolean;
  showRevokeOtherSessions?: boolean;
  translate?: Translate;
  className?: string;
}

export const ChangePasswordForm = ({
  onSubmit,
  onSuccess,
  onError,
  requireCurrentPassword = true,
  minPasswordLength = 8,
  showRequirements = true,
  showStrengthIndicator = true,
  showRevokeOtherSessions = true,
  translate,
  className,
}: ChangePasswordFormProps) => {
  const defaultT = useAuthT();
  const t = translate ?? defaultT;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validation = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
      requireCurrent: requireCurrentPassword,
      minLength: minPasswordLength,
    });

    if (!validation.valid) {
      const msg = t(validation.error || 'auth.validation.passwordTooShort');
      setError(msg);
      onError?.(msg);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        currentPassword,
        newPassword,
        revokeOtherSessions: showRevokeOtherSessions ? revokeOtherSessions : undefined,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      const msg = authErrorMessage(err, 'auth.errors.resetFailed');
      setError(t(msg) || msg);
      onError?.(t(msg) || msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('uauth-form', className)} noValidate>
      {error && <AuthErrorBanner message={error} translate={t} />}

      {success && (
        <div
          className="uauth-form-alert uauth-form-alert--success"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="uauth-form-alert__icon" aria-hidden="true" />
          <span>{t('auth.changePassword.success')}</span>
        </div>
      )}

      <div className="uauth-form__group">
        {requireCurrentPassword && (
          <PasswordInput
            id="uauth-current-password"
            labelKey="auth.changePassword.currentPassword"
            placeholderKey="auth.placeholders.password"
            value={currentPassword}
            onChange={setCurrentPassword}
            translate={t}
            disabled={isLoading}
            required
            autoComplete="current-password"
          />
        )}

        <div>
          <PasswordInput
            id="uauth-new-password"
            labelKey="auth.changePassword.newPassword"
            placeholderKey="auth.placeholders.password"
            value={newPassword}
            onChange={setNewPassword}
            translate={t}
            disabled={isLoading}
            required
            autoComplete="new-password"
          />
          {showStrengthIndicator && newPassword && (
            <PasswordStrengthIndicator password={newPassword} translate={t} />
          )}
          {showRequirements && (
            <PasswordRequirements
              password={newPassword}
              options={{ minLength: minPasswordLength }}
              translate={t}
            />
          )}
        </div>

        <PasswordInput
          id="uauth-confirm-new-password"
          labelKey="auth.changePassword.confirmPassword"
          placeholderKey="auth.placeholders.confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          translate={t}
          disabled={isLoading}
          required
          autoComplete="new-password"
        />

        {showRevokeOtherSessions && (
          <label className="uauth-check-label">
            <input
              type="checkbox"
              checked={revokeOtherSessions}
              onChange={(e) => setRevokeOtherSessions(e.target.checked)}
              disabled={isLoading}
            />
            <span className="uauth-check-label__text">
              {t('auth.changePassword.revokeOthers')}
            </span>
          </label>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="uauth-submit-btn"
      >
        {isLoading ? (
          <>
            <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
            <span>{t('auth.changePassword.submitting')}</span>
          </>
        ) : (
          t('auth.changePassword.submit')
        )}
      </Button>
    </form>
  );
};
