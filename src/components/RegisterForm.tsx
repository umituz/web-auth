import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@umituz/web-localization/react";
import { Loader2 } from "lucide-react";
import { Button, Checkbox, Input } from "@umituz/web-design-system/atoms";
import { cn } from "@umituz/web-design-system/utils/cn";
import type { RegisterFormProps, RegisterData, Translate } from "../types/auth";
import { validateRegister } from "../utils/auth";
import { AUTH_KEYS } from "../utils/i18nKeys";
import { AUTH_VALIDATION_KEYS } from "../utils/validationKeys";
import {
  AuthErrorBanner,
  EmailInput,
  PasswordInput,
  PasswordStrengthIndicator,
  SocialLoginButtons,
} from "./shared";

const KEYS = {
  title: 'auth.register.createAccount',
  join: 'auth.register.join',
  nameLabel: 'auth.fields.name',
  namePlaceholder: 'auth.placeholders.fullName',
  emailLabel: AUTH_KEYS.fields.email,
  emailPlaceholder: AUTH_KEYS.placeholders.emailExample,
  passwordLabel: AUTH_KEYS.fields.password,
  passwordPlaceholder: AUTH_KEYS.placeholders.password,
  confirmPassword: 'auth.register.confirmPassword',
  submit: 'auth.register.submit',
  submitting: 'auth.register.submitting',
  acceptTerms: 'auth.register.acceptTerms',
  termsOfService: 'auth.register.termsOfService',
  termsAnd: 'auth.register.termsAnd',
  privacyPolicy: 'auth.register.privacyPolicy',
  haveAccount: 'auth.register.haveAccount',
  signIn: 'auth.register.signIn',
  orContinueWith: 'auth.login.orContinueWith',
  invalidData: 'auth.errors.registrationFailed',
  mustAcceptTerms: 'auth.register.mustAcceptTerms',
  passwordsDoNotMatch: AUTH_VALIDATION_KEYS.passwordsDoNotMatch,
} as const;

export const RegisterForm = ({
  config,
  defaultData = {},
  showTerms = true,
  showLoginLink = true,
  requirePasswordConfirm = true,
  showSocialLogin = true,
  onRegisterAttempt,
  onRegisterSuccess,
  onRegisterError,
  onGoogleLogin,
  onAppleLogin,
}: RegisterFormProps) => {
  const navigate = useNavigate();
  const t = useT();
  const translate: Translate = t;

  const [name, setName] = useState<string>(defaultData.name ?? '');
  const [email, setEmail] = useState<string>(defaultData.email ?? '');
  const [password, setPassword] = useState<string>(defaultData.password ?? '');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = !requirePasswordConfirm || password === confirmPassword;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const validation = validateRegister(
        { email, password, name, confirmPassword },
        false,
        requirePasswordConfirm,
      );
      if (!validation.valid) {
        const message = validation.error ?? KEYS.invalidData;
        setError(message);
        onRegisterError?.(message);
        return;
      }

      if (showTerms && !agreeToTerms) {
        setError(KEYS.mustAcceptTerms);
        onRegisterError?.(KEYS.mustAcceptTerms);
        return;
      }

      setIsLoading(true);
      try {
        if (!onRegisterAttempt) {
          throw new Error('No register handler configured');
        }
        const registerData: RegisterData = { email, password, name };
        const user = await onRegisterAttempt(registerData);
        await onRegisterSuccess?.(user);
        navigate(config.afterLoginRoute);
      } catch (err) {
        const message = err instanceof Error ? err.message : KEYS.invalidData;
        setError(message);
        onRegisterError?.(message);
      } finally {
        setIsLoading(false);
      }
    },
    [
      agreeToTerms,
      config.afterLoginRoute,
      confirmPassword,
      email,
      name,
      navigate,
      onRegisterAttempt,
      onRegisterError,
      onRegisterSuccess,
      password,
      requirePasswordConfirm,
      showTerms,
    ],
  );

  const handleSocial = useCallback(
    (provider: 'google' | 'apple') => {
      if (provider === 'google') onGoogleLogin?.();
      if (provider === 'apple') onAppleLogin?.();
    },
    [onGoogleLogin, onAppleLogin],
  );

  return (
    <form onSubmit={handleSubmit} className="uauth-form" noValidate>
      <div className="uauth-form__header">
        <h1 className="uauth-form__title uauth-form__title--lg">
          {translate(KEYS.title)}
        </h1>
        <p className="uauth-form__subtitle">
          {translate(KEYS.join, { brand: config.brandName })}
        </p>
      </div>

      <AuthErrorBanner message={error} translate={translate} />

      <div className="uauth-field">
        <label htmlFor="register-name" className="uauth-field__label">
          {translate(KEYS.nameLabel)}
        </label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          disabled={isLoading}
          value={name}
          placeholder={translate(KEYS.namePlaceholder)}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <EmailInput
        id="register-email"
        labelKey={KEYS.emailLabel}
        placeholderKey={KEYS.emailPlaceholder}
        value={email}
        onChange={setEmail}
        translate={translate}
        disabled={isLoading}
        required
      />

      <div className="uauth-form__group">
        <PasswordInput
          id="register-password"
          labelKey={KEYS.passwordLabel}
          placeholderKey={KEYS.passwordPlaceholder}
          value={password}
          onChange={setPassword}
          translate={translate}
          autoComplete="new-password"
          disabled={isLoading}
          required
        />
        <PasswordStrengthIndicator password={password} translate={translate} />
      </div>

      {requirePasswordConfirm && (
        <div className="uauth-field">
          <label htmlFor="register-confirm" className="uauth-field__label">
            {translate(KEYS.confirmPassword)}
            <span className="uauth-field__required" aria-hidden="true">*</span>
          </label>
          <Input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            required
            disabled={isLoading}
            value={confirmPassword}
            placeholder={translate(KEYS.passwordPlaceholder)}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(confirmPassword) && !passwordsMatch}
            className={cn(confirmPassword && !passwordsMatch && 'uauth-input--error')}
          />
          {confirmPassword && !passwordsMatch && (
            <p className="uauth-field__error" role="alert">
              {translate(KEYS.passwordsDoNotMatch)}
            </p>
          )}
        </div>
      )}

      {showTerms && (
        <label className="uauth-check-label uauth-check-label--multiline">
          <Checkbox
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(Boolean(checked))}
            disabled={isLoading}
            aria-label={translate(KEYS.acceptTerms)}
          />
          <span className="uauth-check-label__text">
            {translate(KEYS.acceptTerms)}{' '}
            <a href="/terms" className="uauth-text-link">
              {translate(KEYS.termsOfService)}
            </a>{' '}
            {translate(KEYS.termsAnd)}{' '}
            <a href="/privacy" className="uauth-text-link">
              {translate(KEYS.privacyPolicy)}
            </a>
          </span>
        </label>
      )}

      <Button
        type="submit"
        className="uauth-submit-btn uauth-submit-btn--pill"
        disabled={isLoading || (requirePasswordConfirm && !passwordsMatch)}
      >
        {isLoading ? (
          <>
            <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
            {translate(KEYS.submitting)}
          </>
        ) : (
          translate(KEYS.submit)
        )}
      </Button>

      {showLoginLink && config.loginRoute && (
        <p className="uauth-form__footer-text">
          {translate(KEYS.haveAccount)}{' '}
          <button
            type="button"
            onClick={() => navigate(config.loginRoute)}
            className="uauth-link-btn uauth-link-btn--strong"
            disabled={isLoading}
          >
            {translate(KEYS.signIn)}
          </button>
        </p>
      )}

      {showSocialLogin && config.showSocialLogin && config.socialProviders && config.socialProviders.length > 0 && (
        <>
          <div className="uauth-divider-row">
            <span className="uauth-divider-row__label">
              {translate(KEYS.orContinueWith)}
            </span>
          </div>
          <SocialLoginButtons
            onProvider={handleSocial}
            translate={translate}
            disabled={isLoading}
          />
        </>
      )}
    </form>
  );
};

export default RegisterForm;
