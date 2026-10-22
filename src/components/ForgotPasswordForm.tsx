import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@umituz/web-localization/react";
import { ArrowLeft, Loader2, CheckCircle2, Check } from "lucide-react";
import { Button } from "@umituz/web-design-system/atoms";
import type { ForgotPasswordFormProps, Translate } from "../types/auth";
import { validateForgotPassword } from "../utils/auth";
import { authErrorMessage } from "../utils/errors";
import { AUTH_KEYS } from "../utils/i18nKeys";
import { AUTH_VALIDATION_KEYS } from "../utils/validationKeys";
import { AuthErrorBanner, EmailInput } from "./shared";

const KEYS = {
  title: 'auth.forgotPassword.title',
  description: 'auth.forgotPassword.description',
  emailLabel: AUTH_KEYS.fields.email,
  emailPlaceholder: AUTH_KEYS.placeholders.emailExample,
  submitting: 'auth.forgotPassword.submitting',
  submit: 'auth.forgotPassword.submit',
  backToSignIn: 'auth.forgotPassword.backToSignIn',
  successTitle: 'auth.forgotPassword.successTitle',
  successMessage: 'auth.forgotPassword.successMessage',
  sentTo: 'auth.forgotPassword.sentTo',
  step1: 'auth.forgotPassword.steps.step1',
  step2: 'auth.forgotPassword.steps.step2',
  step3: 'auth.forgotPassword.steps.step3',
  invalidEmail: AUTH_VALIDATION_KEYS.emailInvalid,
  sendResetFailed: 'auth.errors.sendResetFailed',
} as const;

export const ForgotPasswordForm = ({
  config,
  onSuccess,
  onError,
  showBackLink = true,
}: ForgotPasswordFormProps) => {
  const navigate = useNavigate();
  const t = useT();
  const translate: Translate = t;

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateForgotPassword({ email });
    if (!validation.valid) {
      const message = validation.error ?? KEYS.invalidEmail;
      setError(message);
      onError?.(message);
      return;
    }

    setIsLoading(true);
    try {
      await onSuccess?.({ email });
      setSuccess(true);
    } catch (err) {
      const message = authErrorMessage(err, KEYS.sendResetFailed);
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="uauth-form" role="status" aria-live="polite">
        <div className="uauth-form__header">
          <div className="uauth-success-badge">
            <CheckCircle2 className="uauth-success-badge__icon" aria-hidden="true" />
          </div>
          <h1 className="uauth-form__title">
            {translate(KEYS.successTitle)}
          </h1>
          <p className="uauth-form__subtitle">
            {translate(KEYS.sentTo)}{' '}
            <span className="uauth-form__subtitle-strong">{email}</span>
          </p>
        </div>

        <ol className="uauth-steps-list">
          <li className="uauth-steps-list__item">
            <Check className="uauth-steps-list__icon" aria-hidden="true" />
            {translate(KEYS.step1)}
          </li>
          <li className="uauth-steps-list__item">
            <Check className="uauth-steps-list__icon" aria-hidden="true" />
            {translate(KEYS.step2)}
          </li>
          <li className="uauth-steps-list__item">
            <Check className="uauth-steps-list__icon" aria-hidden="true" />
            {translate(KEYS.step3)}
          </li>
        </ol>

        {showBackLink && config.loginRoute && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(config.loginRoute)}
            className="uauth-submit-btn"
          >
            <ArrowLeft className="uauth-btn__spinner" aria-hidden="true" />
            {translate(KEYS.backToSignIn)}
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="uauth-form" noValidate>
      <div className="uauth-form__header">
        <h1 className="uauth-form__title uauth-form__title--lg">
          {translate(KEYS.title)}
        </h1>
        <p className="uauth-form__subtitle">{translate(KEYS.description)}</p>
      </div>

      <AuthErrorBanner message={error} translate={translate} />

      <EmailInput
        id="forgot-email"
        labelKey={KEYS.emailLabel}
        placeholderKey={KEYS.emailPlaceholder}
        value={email}
        onChange={setEmail}
        translate={translate}
        disabled={isLoading}
        required
      />

      <Button
        type="submit"
        className="uauth-submit-btn uauth-submit-btn--pill"
        disabled={isLoading}
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

      {showBackLink && config.loginRoute && (
        <button
          type="button"
          onClick={() => navigate(config.loginRoute)}
          className="uauth-back-link"
        >
          <ArrowLeft className="uauth-back-link__icon" aria-hidden="true" />
          {translate(KEYS.backToSignIn)}
        </button>
      )}
    </form>
  );
};

export default ForgotPasswordForm;
