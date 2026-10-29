import { useState } from "react";
import { Building2, Check, ChevronDown } from "lucide-react";
import { cn } from "@umituz/web-design-system/utils/cn";
import { useT } from "@umituz/web-localization/react";
import { SESSION_KEYS } from "./utils/i18nKeys";
import type { Tenant } from "./types";

export interface OrgSwitcherProps {
  tenants: Tenant[];
  activeTenantId?: string | null;
  onSwitch: (tenantId: string) => void;
  disabled?: boolean;
  className?: string;
}

const initialsOf = (tenant: Tenant): string =>
  tenant.initials ??
  tenant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

export const OrgSwitcher = ({
  tenants,
  activeTenantId,
  onSwitch,
  disabled = false,
  className,
}: OrgSwitcherProps) => {
  const t = useT();
  const [open, setOpen] = useState(false);

  if (tenants.length === 0) return null;

  const active = tenants.find((tenant) => tenant.id === activeTenantId) ?? tenants[0];
  if (!active) return null;

  return (
    <div className={cn("uauth-header__anchor", className)}>
      <button
        type="button"
        className="uauth-profile-btn"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t(SESSION_KEYS.orgSwitcher.label)}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="uauth-avatar">{initialsOf(active)}</span>
        <span className="uauth-org">
          <span className="uauth-org__name">{active.name}</span>
          {active.plan && <span className="uauth-org__meta">{active.plan}</span>}
        </span>
        <ChevronDown
          className={cn(
            "uauth-profile-btn__chevron",
            open && "uauth-profile-btn__chevron--open",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="uauth-overlay"
            aria-label="close tenant menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="uauth-menu uauth-org-menu" role="menu">
            {tenants.map((tenant) => {
              const isActive = tenant.id === active.id;
              return (
                <button
                  key={tenant.id}
                  type="button"
                  role="menuitem"
                  className={cn(
                    "uauth-menu__item",
                    isActive && "uauth-menu__item--active",
                  )}
                  onClick={() => {
                    onSwitch(tenant.id);
                    setOpen(false);
                  }}
                >
                  <Building2 className="uauth-menu__item-icon" aria-hidden="true" />
                  <span className="uauth-org-menu__label">{tenant.name}</span>
                  {isActive && <Check className="uauth-org-menu__check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default OrgSwitcher;
