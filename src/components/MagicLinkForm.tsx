import { useState } from "react";
import { useNavigate } from "react-router";
import { Link2, Send } from "lucide-react";
import { Button, Input } from "@umituz/web-design-system/atoms";
import { useSession } from "../session";
import type { MagicLinkResult } from "../session";
import { validateForgotPassword } from "../utils/auth";
import { AUTH_KEYS } from "../utils/i18nKeys";
import type { MagicLinkFormProps, Translate } from "../types/auth";
import { AuthErrorBanner } from "./shared";

const KEYS = {
  emailPlaceholder: 'auth.placeholders.emailExample',
  submit: 'auth.magicLink.submit',
  submitting: 'auth.magicLink.submitting',
  openLink: 'auth.magicLink.openLink',
  requestFailed: 'auth.magicLink.requestFailed',
} as const;

const DEFAULT_STRINGS: Record<string, string> = {
  [KEYS.submit]: 'Send sign-in link',
  [KEYS.submitting]: 'Sending…',
  [KEYS.openLink]: 'Open sign-in link',
  [KEYS.requestFailed]: 'Could not send sign-in link',
  'auth.magicLink.demoNote': "Demo mode — the email isn't sent, use the link directly:",
  'auth.magicLink.sentNote': 'If this address has an account, a sign-in link is on its way.',
  'auth.fields.email': 'Email',
  'auth.placeholders.emailExample': 'you@example.com',
  'auth.errors.emailRequired': 'Email is required',
  'auth.errors.emailInvalid': 'Enter a valid email address',
};

export const MagicLinkForm = ({
  config,
  onRequestLink,
  onLinkSent,
  translate,
  disabled = false,
}: MagicLinkFormProps) => {
  const t: Translate = translate ?? ((key) => DEFAULT_STRINGS[key] ?? key);
  const { requestMagicLink } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MagicLinkResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || disabled) return;
    setError(null);
    const validation = validateForgotPassword({ email });
    if (!validation.valid) {
      setError(validation.error ?? KEYS.requestFailed);
      return;
    }
    setBusy(true);
    try {
      const res = onRequestLink
        ? await onRequestLink(email)
        : await requestMagicLink(email);
      setResult(res);
      await onLinkSent?.(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : t(KEYS.requestFailed));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AuthErrorBanner message={error} translate={t} />

      <form className="uauth-magic-form" onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          placeholder={t(KEYS.emailPlaceholder)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label={t(AUTH_KEYS.fields.email)}
          disabled={busy || disabled}
          required
        />
        <Button type="submit" disabled={busy || disabled || email.length === 0}>
          <Send size={15} aria-hidden="true" />
          {busy ? t(KEYS.submitting) : t(KEYS.submit)}
        </Button>
      </form>

      {result && (
        <div className="uauth-magic-result">
          {result.link ? (
            <>
              <p className="uauth-magic-result__note">
                {config.magicLinkDemoNote ?? t('auth.magicLink.demoNote')}
              </p>
              <Button variant="outline" onClick={() => navigate(result.link ?? "")}>
                <Link2 size={15} aria-hidden="true" />
                {t(KEYS.openLink)}
              </Button>
            </>
          ) : (
            <p className="uauth-magic-result__note">
              {config.magicLinkSentNote ?? t('auth.magicLink.sentNote')}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default MagicLinkForm;
