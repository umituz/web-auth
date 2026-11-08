import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { AuthErrorBanner } from "./shared";
import { useSession } from "../session";
import { resolveHomeRoute } from "../utils/auth";
import { authT } from "../utils/messages";
import type { MagicLinkVerifyPageProps, Translate } from "../types/auth";

const KEYS = {
  title: 'auth.magicLink.verifyTitle',
  subtitle: 'auth.magicLink.verifySubtitle',
  missingToken: 'auth.magicLink.missingToken',
  failed: 'auth.magicLink.verifyFailed',
} as const;

export const MagicLinkVerifyPage = ({ config, onVerified, translate }: MagicLinkVerifyPageProps) => {
  const t: Translate = translate ?? authT;
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { verifyToken } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t(KEYS.missingToken));
      return;
    }
    let cancelled = false;
    verifyToken(token)
      .then((user) => {
        if (cancelled) return;
        if (onVerified) {
          void onVerified(user);
        } else {
          navigate(resolveHomeRoute(config, user.role));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t(KEYS.failed));
      });
    return () => {
      cancelled = true;
    };
  }, [token, verifyToken, navigate, config, onVerified, t]);

  return (
    <AuthLayout config={config} translate={translate}>
      <div className="uauth-form">
        <div className="uauth-form__header">
          <h1 className="uauth-form__title uauth-form__title--lg">{t(KEYS.title)}</h1>
          <p className="uauth-form__subtitle">
            <Loader2 className="uauth-btn__spinner" size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />
            {t(KEYS.subtitle)}
          </p>
        </div>
        <AuthErrorBanner message={error} translate={t} />
      </div>
    </AuthLayout>
  );
};

export default MagicLinkVerifyPage;
