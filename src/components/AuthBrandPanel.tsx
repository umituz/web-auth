import type { CSSProperties, ReactNode } from "react";
import { cn } from "@umituz/web-design-system/utils/cn";

export interface AuthBrandStat {
  label: string;
  value: string | number;
}

export interface AuthBrandNote {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface AuthBrandPanelProps {
  brandName?: string;
  brandMark?: ReactNode;
  brandKicker?: string;
  title: ReactNode;
  description?: ReactNode;
  stats?: Array<AuthBrandStat | [string | number, string]>;
  notes?: Array<AuthBrandNote | [string, string]>;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function AuthBrandPanel({
  brandName,
  brandMark,
  brandKicker,
  title,
  description,
  stats,
  notes,
  footer,
  children,
  className,
  style,
}: AuthBrandPanelProps) {
  return (
    <div className={cn("uauth-brand-panel", className)} style={style}>
      {(brandMark || brandName || brandKicker) && (
        <div className="uauth-brand-panel__header">
          {brandMark && (
            typeof brandMark === "string" ? (
              <span className="uauth-brand-panel__mark">{brandMark}</span>
            ) : (
              brandMark
            )
          )}
          {brandName && <span className="uauth-brand-panel__name">{brandName}</span>}
          {brandKicker && <span className="uauth-brand-panel__kicker">{brandKicker}</span>}
        </div>
      )}

      <div className="uauth-brand-panel__body">
        {title && <h1 className="uauth-brand-panel__title">{title}</h1>}
        {description && <p className="uauth-brand-panel__desc">{description}</p>}

        {stats && stats.length > 0 && (
          <div className="uauth-brand-panel__stats">
            {stats.map((item, index) => {
              const stat: AuthBrandStat = Array.isArray(item)
                ? { value: item[0], label: item[1] }
                : item;
              return (
                <div key={stat.label || index} className="uauth-brand-panel__stat">
                  <span className="uauth-brand-panel__stat-value">{stat.value}</span>
                  <span className="uauth-brand-panel__stat-label">{stat.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {notes && notes.length > 0 && (
          <div className="uauth-brand-panel__notes">
            {notes.map((item, index) => {
              const note: AuthBrandNote = Array.isArray(item)
                ? { title: item[0], description: item[1] }
                : item;
              return (
                <div key={note.title || index} className="uauth-brand-panel__note">
                  {note.icon && (
                    <span className="uauth-brand-panel__note-icon">{note.icon}</span>
                  )}
                  <div>
                    <p className="uauth-brand-panel__note-title">{note.title}</p>
                    <p className="uauth-brand-panel__note-desc">{note.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {children}
      </div>

      {footer && <div className="uauth-brand-panel__footer">{footer}</div>}
    </div>
  );
}
