import { Laptop, Smartphone, Globe, Loader2, LogOut } from 'lucide-react';
import { Button } from '@umituz/web-design-system/atoms';
import { cn } from '@umituz/web-design-system/utils/cn';
import { useAuthT } from '../utils/messages';
import type { Translate } from '../types/auth';

export interface ActiveSession {
  id: string;
  token?: string;
  isCurrent?: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string | number;
  expiresAt?: string | number;
}

export interface ActiveSessionsListProps {
  sessions: ActiveSession[];
  onRevokeSession?: (sessionId: string) => Promise<void>;
  onRevokeOtherSessions?: () => Promise<void>;
  busySessionId?: string | null;
  busyRevokeAll?: boolean;
  translate?: Translate;
  className?: string;
}

function parseDevice(userAgent?: string): { name: string; type: 'mobile' | 'desktop' | 'unknown' } {
  if (!userAgent) return { name: 'Unknown device', type: 'unknown' };
  const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
  let browser = 'Browser';
  if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Safari';
  else if (/edge|edg/i.test(userAgent)) browser = 'Edge';

  let os = '';
  if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  const name = [browser, os].filter(Boolean).join(' on ') || 'Web session';
  return { name, type: isMobile ? 'mobile' : 'desktop' };
}

export const ActiveSessionsList = ({
  sessions,
  onRevokeSession,
  onRevokeOtherSessions,
  busySessionId = null,
  busyRevokeAll = false,
  translate,
  className,
}: ActiveSessionsListProps) => {
  const defaultT = useAuthT();
  const t = translate ?? defaultT;

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className={cn('uauth-sessions', className)}>
      <div className="uauth-sessions__header">
        <div>
          <h3 className="uauth-sessions__title">{t('auth.sessions.title')}</h3>
          <p className="uauth-sessions__subtitle">{t('auth.sessions.subtitle')}</p>
        </div>

        {onRevokeOtherSessions && otherSessions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRevokeOtherSessions}
            disabled={busyRevokeAll || !!busySessionId}
          >
            {busyRevokeAll ? (
              <>
                <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
                <span>{t('auth.sessions.revoking')}</span>
              </>
            ) : (
              <>
                <LogOut size={13} aria-hidden="true" />
                <span>{t('auth.sessions.revokeAllOthers')}</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="uauth-sessions__list">
        {sessions.map((session) => {
          const { name, type } = parseDevice(session.userAgent);
          const isBusy = busySessionId === session.id;

          return (
            <div
              key={session.id}
              className={cn(
                'uauth-session-card',
                session.isCurrent && 'uauth-session-card--current',
              )}
            >
              <div className="uauth-session-card__icon-wrap">
                {type === 'mobile' ? (
                  <Smartphone className="uauth-session-card__icon" aria-hidden="true" />
                ) : type === 'desktop' ? (
                  <Laptop className="uauth-session-card__icon" aria-hidden="true" />
                ) : (
                  <Globe className="uauth-session-card__icon" aria-hidden="true" />
                )}
              </div>

              <div className="uauth-session-card__info">
                <div className="uauth-session-card__title-row">
                  <span className="uauth-session-card__name">{name}</span>
                  {session.isCurrent && (
                    <span className="uauth-session-card__badge">
                      {t('auth.sessions.current')}
                    </span>
                  )}
                </div>

                <div className="uauth-session-card__meta">
                  {session.ipAddress && <span>{session.ipAddress}</span>}
                  {session.createdAt && (
                    <span>
                      {typeof session.createdAt === 'number'
                        ? new Date(session.createdAt).toLocaleDateString()
                        : String(session.createdAt)}
                    </span>
                  )}
                </div>
              </div>

              {!session.isCurrent && onRevokeSession && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevokeSession(session.id)}
                  disabled={isBusy || busyRevokeAll}
                >
                  {isBusy ? (
                    <Loader2 className="uauth-btn__spinner" aria-hidden="true" />
                  ) : (
                    t('auth.sessions.revoke')
                  )}
                </Button>
              )}
            </div>
          );
        })}

        {sessions.length === 0 && (
          <p className="uauth-sessions__empty">{t('auth.sessions.empty')}</p>
        )}
      </div>
    </div>
  );
};
