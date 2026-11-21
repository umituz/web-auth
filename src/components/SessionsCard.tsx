import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Card } from '@umituz/web-design-system/organisms';
import { cn } from '@umituz/web-design-system/utils/cn';
import { ActiveSessionsList, type ActiveSession } from './ActiveSessionsList';
import { createConsentClient, type ConsentClient, type SessionEntry } from '../consent';
import type { Translate } from '../types/auth';

export interface SessionsCardProps {
  readonly client?: ConsentClient;
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  readonly loadingLabel?: string;
  readonly onRevokeSuccess?: (sessionId: string) => void;
  readonly onRevokeAllSuccess?: () => void;
  readonly onError?: (error: unknown) => void;
  readonly translate?: Translate;
  readonly className?: string;
}

export function SessionsCard({
  client,
  title,
  description,
  loadingLabel = 'Loading sessions…',
  onRevokeSuccess,
  onRevokeAllSuccess,
  onError,
  translate,
  className,
}: SessionsCardProps) {
  const consentClient = useMemo(() => client ?? createConsentClient(), [client]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [busyRevokeAll, setBusyRevokeAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await consentClient.fetchActiveSessions();
      setSessions(res.sessions ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sessions.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [consentClient, onError]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleRevoke = useCallback(
    async (sessionId: string) => {
      const entry = sessions.find((s) => s.id === sessionId);
      if (!entry?.token) return;
      setBusySessionId(sessionId);
      setError(null);
      try {
        await consentClient.revokeSession(entry.token);
        await loadSessions();
        onRevokeSuccess?.(sessionId);
      } catch (err) {
        setError('Could not revoke the session. Try again.');
        onError?.(err);
      } finally {
        setBusySessionId(null);
      }
    },
    [sessions, consentClient, loadSessions, onRevokeSuccess, onError],
  );

  const handleRevokeOthers = useCallback(async () => {
    setBusyRevokeAll(true);
    setError(null);
    try {
      await consentClient.revokeOtherSessions();
      await loadSessions();
      onRevokeAllSuccess?.();
    } catch (err) {
      setError('Could not revoke the sessions. Try again.');
      onError?.(err);
    } finally {
      setBusyRevokeAll(false);
    }
  }, [consentClient, loadSessions, onRevokeAllSuccess, onError]);

  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      {title && (
        <div className="mb-4">
          <div className="font-display text-lg font-semibold text-ink">{title}</div>
          {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-sm text-ink-3">{loadingLabel}</p>
      ) : (
        <ActiveSessionsList
          sessions={sessions as ActiveSession[]}
          onRevokeSession={handleRevoke}
          onRevokeOtherSessions={handleRevokeOthers}
          busySessionId={busySessionId}
          busyRevokeAll={busyRevokeAll}
          translate={translate}
        />
      )}
    </Card>
  );
}
