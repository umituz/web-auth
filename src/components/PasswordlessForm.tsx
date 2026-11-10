import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@umituz/web-design-system/atoms";
import { validatePasswordless } from "../utils/auth";
import { authErrorMessage } from "../utils/errors";
import { authT } from "../utils/messages";
import { AUTH_KEYS } from "../utils/i18nKeys";
import { AUTH_VALIDATION_KEYS } from "../utils/validationKeys";
import type { PasswordlessFormProps, Translate } from "../types/auth";
import { AuthErrorBanner, EmailInput } from "./shared";

const KEYS = {
  title: 'auth.passwordless.title',
  subtitle: 'auth.passwordless.subtitle',
  emailLabel: AUTH_KEYS.fields.email,
  emailPlaceholder: AUTH_KEYS.placeholders.emailExample,
  submit: 'auth.passwordless.submit',
  submitting: 'auth.passwordless.submitting',
  demoAccounts: 'auth.passwordless.demoAccounts',
  invalidEmail: AUTH_VALIDATION_KEYS.emailInvalid,
  loginFailed: 'auth.passwordless.loginFailed',
  noAuthProvider: 'auth.errors.noAuthProvider',
} as const;

export const PasswordlessForm = ({
  config,
  description,
  demoAccounts,
  defaultEmail,
  onEmailChange,
  disabled = false,
  autoFocusEmail = false,
  statusKeys,
  onBusyChange,
  onPasswordlessLogin,
  onLoginError,
  translate,
}: PasswordlessFormProps) => {
  const t: Translate = translate ?? authT;

  const [email, setEmail] = useState(defaultEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inert = disabled || loading;

  useEffect(() => {
    onBusyChange?.(loading);
  }, [loading, onBusyChange]);

  const updateEmail = useCallback(
    (value: string) => {
      setEmail(value);
      onEmailChange?.(value);
    },
    [onEmailChange],
  );

  const send = useCallback(
    async (target: string) => {
      if (!onPasswordlessLogin) {
        setError(KEYS.noAuthProvider);
        onLoginError?.(KEYS.noAuthProvider);
        return;
      }
      if (disabled) return;
      setError(null);
      setLoading(true);
      try {
        await onPasswordlessLogin(target);
      } catch (err) {
        const message = authErrorMessage(err, KEYS.loginFailed, statusKeys);
        setError(message);
        onLoginError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [onPasswordlessLogin, onLoginError, statusKeys, disabled],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inert) return;

    const validation = validatePasswordless({ email });
    if (!validation.valid) {
      const message = validation.error ?? KEYS.invalidEmail;
      setError(message);
      onLoginError?.(message);
      return;
    }

    await send(email);
  };

  const accounts = demoAccounts ?? [];

  return (
    <form onSubmit={handleSubmit} className="uauth-form" noValidate>
      <div className="uauth-form__header">
        <h1 className="uauth-form__title">
          {t(KEYS.title)}
        </h1>
        <p className="uauth-form__subtitle">
          {description ?? t(KEYS.subtitle, { brand: config.brandName })}
        </p>
      </div>

      <AuthErrorBanner message={error} translate={t} />

      <EmailInput
        id="passwordless-email"
        labelKey={KEYS.emailLabel}
        placeholderKey={KEYS.emailPlaceholder}
        value={email}
        onChange={updateEmail}
        translate={t}
        disabled={inert}
        required
        autoFocus={autoFocusEmail}
      />

      <Button type="submit" disabled={inert} className="uauth-submit-btn">
        {loading ? (
          <>
            <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
            {t(KEYS.submitting)}
          </>
        ) : (
          t(KEYS.submit)
        )}
      </Button>

      {accounts.length > 0 && (
        <>
          <div className="uauth-divider-row">
            <span className="uauth-divider-row__label">
              {t(KEYS.demoAccounts)}
            </span>
          </div>
          <div className="uauth-demo-users">
            {accounts.map((account) => (
              <Button
                key={account.id}
                type="button"
                variant="secondary"
                className="uauth-demo-user"
                disabled={inert}
                onClick={() => void send(account.email)}
              >
                <span className="uauth-demo-user-text">
                  <b className="uauth-demo-user-name">{account.label ?? account.email}</b>
                  <span className="uauth-demo-user-meta">{account.meta ?? account.email}</span>
                </span>
              </Button>
            ))}
          </div>
        </>
      )}
    </form>
  );
};

export default PasswordlessForm;
