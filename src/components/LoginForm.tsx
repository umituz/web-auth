import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@umituz/web-localization/react";
import { Button, Checkbox } from "@umituz/web-design-system/atoms";
import { Loader2 } from "lucide-react";
import { validateLogin } from "../utils/auth";
import type {
  LoginFormProps,
  LoginCredentials,
  User,
  Translate,
} from "../types/auth";
import {
  AuthErrorBanner,
  EmailInput,
  PasswordInput,
  SocialLoginButtons,
} from "./shared";

const KEYS = {
  welcomeBack: 'auth.login.welcomeBack',
  signInTo: 'auth.login.signInTo',
  emailLabel: 'auth.fields.email',
  emailPlaceholder: 'auth.placeholders.emailExample',
  passwordLabel: 'auth.fields.password',
  passwordPlaceholder: 'auth.placeholders.password',
  rememberMe: 'auth.login.rememberMe',
  forgotPassword: 'auth.login.forgotPassword',
  submit: 'auth.login.submit',
  submitting: 'auth.login.submitting',
  noAccount: 'auth.login.noAccount',
  signUp: 'auth.login.signUp',
  orContinueWith: 'auth.login.orContinueWith',
  invalidCredentials: 'auth.errors.invalidCredentials',
  loginFailed: 'auth.errors.loginFailed',
  noAuthProvider: 'auth.errors.noAuthProvider',
} as const;

export const LoginForm = ({
  config,
  defaultCredentials,
  showRememberMe = true,
  showForgotPassword = true,
  showRegisterLink = true,
  showSocialLogin = true,
  enableMockAuth = false,
  onLoginAttempt,
  onLoginSuccess,
  onLoginError,
  onGoogleLogin,
  onAppleLogin,
}: LoginFormProps) => {
  const navigate = useNavigate();
  const t = useT();
  const translate: Translate = t;

  const [email, setEmail] = useState<string>(defaultCredentials?.email ?? "");
  const [password, setPassword] = useState<string>(defaultCredentials?.password ?? "");
  const [remember, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      if (onLoginAttempt) {
        return onLoginAttempt(credentials);
      }
      if (!enableMockAuth) {
        throw new Error(KEYS.noAuthProvider);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: "1",
        email: credentials.email,
        name: credentials.email.split("@")[0],
      };
    },
    [onLoginAttempt, enableMockAuth],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const validation = validateLogin({ email, password });
      if (!validation.valid) {
        const message = validation.error ?? KEYS.invalidCredentials;
        setError(message);
        onLoginError?.(message);
        return;
      }

      setLoading(true);
      try {
        const user = await performLogin({ email, password });
        await onLoginSuccess?.(user);
        navigate(config.afterLoginRoute);
      } catch (err) {
        const message = err instanceof Error ? err.message : KEYS.loginFailed;
        setError(message);
        onLoginError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, performLogin, navigate, config.afterLoginRoute, onLoginSuccess, onLoginError],
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
        <h1 className="uauth-form__title">
          {translate(KEYS.welcomeBack)}
        </h1>
        <p className="uauth-form__subtitle">
          {translate(KEYS.signInTo, { brand: config.brandName })}
        </p>
      </div>

      <AuthErrorBanner message={error} translate={translate} />

      <EmailInput
        id="login-email"
        labelKey={KEYS.emailLabel}
        placeholderKey={KEYS.emailPlaceholder}
        value={email}
        onChange={setEmail}
        translate={translate}
        disabled={loading}
        required
      />

      <PasswordInput
        id="login-password"
        labelKey={KEYS.passwordLabel}
        placeholderKey={KEYS.passwordPlaceholder}
        value={password}
        onChange={setPassword}
        translate={translate}
        autoComplete="current-password"
        disabled={loading}
        required
      />

      {(showRememberMe || showForgotPassword) && (
        <div className="uauth-form__row">
          {showRememberMe && (
            <label className="uauth-check-label">
              <Checkbox
                checked={remember}
                onCheckedChange={(checked) => setRemember(Boolean(checked))}
                disabled={loading}
              />
              {translate(KEYS.rememberMe)}
            </label>
          )}
          {showForgotPassword && (
            <button
              type="button"
              onClick={() => navigate(config.forgotPasswordRoute ?? '/forgot-password')}
              className="uauth-link-btn"
              disabled={loading}
            >
              {translate(KEYS.forgotPassword)}
            </button>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading} className="uauth-submit-btn">
        {loading ? (
          <>
            <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
            {translate(KEYS.submitting)}
          </>
        ) : (
          translate(KEYS.submit)
        )}
      </Button>

      {showRegisterLink && (
        <p className="uauth-form__footer-text">
          {translate(KEYS.noAccount)}{' '}
          <button
            type="button"
            onClick={() => navigate(config.registerRoute)}
            className="uauth-link-btn uauth-link-btn--strong"
            disabled={loading}
          >
            {translate(KEYS.signUp)}
          </button>
        </p>
      )}

      {showSocialLogin && (
        <>
          <div className="uauth-divider-row">
            <span className="uauth-divider-row__label">
              {translate(KEYS.orContinueWith)}
            </span>
          </div>
          <SocialLoginButtons
            onProvider={handleSocial}
            translate={translate}
            disabled={loading}
          />
        </>
      )}
    </form>
  );
};

export default LoginForm;
