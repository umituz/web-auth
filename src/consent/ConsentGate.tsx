import { useEffect, useState, type ReactNode } from "react";
import { Spinner } from "@umituz/web-design-system/atoms";
import { useSession } from "../session";
import { TermsConsentModal } from "../components";
import type { Translate } from "../types/auth";
import { createConsentClient, type ConsentFetchJson, type ConsentRecord } from "./service";

export interface ConsentGateProps {
  termsVersion: string;
  termsUrl?: string;
  privacyUrl?: string;
  loginRoute?: string;
  basePath?: string;
  fetchJson?: ConsentFetchJson;
  translate?: Translate;
  children: ReactNode;
}

export const ConsentGate = ({
  termsVersion,
  termsUrl,
  privacyUrl,
  loginRoute = "/login",
  basePath,
  fetchJson,
  translate,
  children,
}: ConsentGateProps) => {
  const { user, status, logout } = useSession();
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const authenticated = status === "authenticated" && user !== null;

  useEffect(() => {
    if (!authenticated) {
      setChecked(false);
      return;
    }
    let cancelled = false;
    setChecked(false);
    createConsentClient({ basePath, fetchJson })
      .fetchLatestConsent()
      .then(({ consent }) => {
        if (cancelled) return;
        setRecord(consent);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, user?.id, basePath, fetchJson]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!authenticated) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (record && record.version === termsVersion) {
    return <>{children}</>;
  }

  return (
    <TermsConsentModal
      isOpen
      termsVersion={termsVersion}
      busy={busy}
      termsUrl={termsUrl}
      privacyUrl={privacyUrl}
      translate={translate}
      onConfirm={async (payload) => {
        setBusy(true);
        try {
          const saved = await createConsentClient({ basePath, fetchJson }).recordConsent(payload);
          setRecord(saved);
        } finally {
          setBusy(false);
        }
      }}
      onCancel={async () => {
        await logout().catch(() => undefined);
        window.location.assign(loginRoute);
      }}
    />
  );
};
