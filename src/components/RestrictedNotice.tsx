import type { ReactNode } from "react";

export interface RestrictedNoticeProps {
  title?: ReactNode;
  description?: ReactNode;
  permission?: string;
  requiredRole?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function RestrictedNotice({
  title = "Restricted",
  description,
  permission,
  requiredRole,
  icon = "⌀",
  actionLabel,
  onAction,
  className,
}: RestrictedNoticeProps) {
  const rootClass = className ? `uauth-restricted ${className}` : "uauth-restricted";

  return (
    <div className={rootClass} role="alert">
      <div className="uauth-restricted-card">
        <span className="uauth-restricted-icon" aria-hidden="true">
          {icon}
        </span>
        <h2 className="uauth-restricted-title">{title}</h2>
        <p className="uauth-restricted-desc">
          {description ?? (
            permission ? (
              <>
                Your role does not include <code className="mono">{permission}</code> for this organization.
              </>
            ) : requiredRole ? (
              <>
                This section requires the <code className="mono">{requiredRole}</code> role.
              </>
            ) : (
              "You do not have permission to access this resource."
            )
          )}
        </p>
        {actionLabel && onAction ? (
          <button type="button" className="uauth-restricted-action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
