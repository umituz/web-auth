import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "./AuthLayout";
import { AuthErrorBanner } from "./shared";
import { DemoUserPicker } from "./DemoUserPicker";
import { MagicLinkForm } from "./MagicLinkForm";
import { useSession } from "../session";
import type { DemoUser } from "../session";
import { resolveHomeRoute } from "../utils/auth";
import { authT } from "../utils/messages";
import type { MagicLinkLoginPageProps, Translate } from "../types/auth";

const KEYS = {
  title: 'auth.magicLink.loginTitle',
  subtitle: 'auth.magicLink.loginSubtitle',
  divider: 'auth.magicLink.divider',
  loadFailed: 'auth.magicLink.demoLoadFailed',
  loginFailed: 'auth.magicLink.loginFailed',
} as const;

export const MagicLinkLoginPage = ({
  config,
  title,
  subtitle,
  showDemoPicker,
  onLogin,
  translate,
}: MagicLinkLoginPageProps) => {
  const t: Translate = translate ?? authT;
  const { demoLogin, listDemoUsers } = useSession();
  const navigate = useNavigate();
  const [demoUsers, setDemoUsers] = useState<DemoUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const withPicker = showDemoPicker ?? (config.demoGroups?.length ?? 0) > 0;

  useEffect(() => {
    if (!withPicker) return;
    let cancelled = false;
    listDemoUsers()
      .then((rows) => {
        if (!cancelled) setDemoUsers(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t(KEYS.loadFailed));
      });
    return () => {
      cancelled = true;
    };
  }, [withPicker, listDemoUsers, t]);

  const enterAs = async (userId: string) => {
    setError(null);
    try {
      const next = await demoLogin(userId);
      if (onLogin) await onLogin(next);
      else navigate(resolveHomeRoute(config, next.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : t(KEYS.loginFailed));
    }
  };

  return (
    <AuthLayout config={config} translate={translate}>
      <div className="uauth-form">
        <div className="uauth-form__header">
          <h1 className="uauth-form__title uauth-form__title--lg">{title ?? t(KEYS.title)}</h1>
          <p className="uauth-form__subtitle">{subtitle ?? t(KEYS.subtitle)}</p>
        </div>

        <AuthErrorBanner message={error} translate={t} />

        {withPicker && demoUsers && (
          <DemoUserPicker users={demoUsers} groups={config.demoGroups ?? []} onPick={enterAs} />
        )}

        {withPicker && (
          <div className="uauth-divider-row">
            <span className="uauth-divider-row__label">{t(KEYS.divider)}</span>
          </div>
        )}

        <MagicLinkForm config={config} translate={translate} />
      </div>
    </AuthLayout>
  );
};

export default MagicLinkLoginPage;
