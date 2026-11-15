import { useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import { AuthLayout } from "./AuthLayout";
import { DemoUserPicker } from "./DemoUserPicker";
import { AuthErrorBanner } from "./shared/AuthErrorBanner";
import { useAuthT } from "../utils/messages";
import type { DemoUser, Tenant } from "../session/types";
import type {
  AuthConfig,
  DemoUserGroup,
  DemoUserPick,
  LocaleSwitcherConfig,
  Translate,
} from "../types/auth";

const LOGIN_FAILED_KEY = "auth.errors.loginFailed";

const TITLE_STYLE = {
  margin: "18px 0 0",
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: "-0.02em",
} as const;

export interface DemoLoginPageProps {
  config: AuthConfig;
  users: DemoUser[];
  groups: DemoUserGroup[];
  onPick: (userId: string) => void | Promise<void>;
  onPickPair?: (pick: DemoUserPick) => void | Promise<void>;
  orgs?: Tenant[];
  ready?: boolean;
  isAuthenticated?: boolean;
  redirectTo?: string;
  title?: string;
  translate?: Translate;
  localeSwitcher?: LocaleSwitcherConfig;
  children?: ReactNode;
}

export const DemoLoginPage = ({
  config,
  users,
  groups,
  onPick,
  onPickPair,
  orgs,
  ready = true,
  isAuthenticated = false,
  redirectTo,
  title,
  translate,
  localeSwitcher,
  children,
}: DemoLoginPageProps) => {
  const t = useAuthT();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo ?? config.afterLoginRoute} replace />;
  }

  const run = async (fn: () => void | Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch {
      setError(LOGIN_FAILED_KEY);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout config={config} translate={translate ?? t} localeSwitcher={localeSwitcher}>
      {title ? <h2 style={TITLE_STYLE}>{title}</h2> : null}
      {ready ? (
        <DemoUserPicker
          users={users}
          groups={groups}
          orgs={orgs}
          onPick={(userId) => void run(() => onPick(userId))}
          onPickPair={onPickPair ? (pick) => void run(() => onPickPair(pick)) : undefined}
        />
      ) : null}
      <AuthErrorBanner message={error} translate={t} />
      {children}
    </AuthLayout>
  );
};

export default DemoLoginPage;
