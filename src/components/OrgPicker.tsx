import { Button } from "@umituz/web-design-system/atoms";
import { authT } from "../utils/messages";
import type { OrgPickerProps, Translate } from "../types/auth";
import type { Tenant } from "../session/types";

const KEYS = {
  title: 'auth.orgPicker.title',
} as const;

const initialsOf = (org: Tenant): string =>
  org.initials ??
  org.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

export const OrgPicker = ({ orgs, onPick, title, translate }: OrgPickerProps) => {
  const t: Translate = translate ?? authT;

  if (orgs.length === 0) return null;

  return (
    <div className="uauth-org-picker">
      <h2 className="uauth-org-picker__title">{title ?? t(KEYS.title)}</h2>
      <div className="uauth-org-picker__orgs">
        {orgs.map((org) => (
          <Button
            key={org.id}
            type="button"
            variant="secondary"
            className="uauth-org-card"
            onClick={() => void onPick(org.id)}
          >
            <span className="uauth-avatar">{initialsOf(org)}</span>
            <span className="uauth-org-card__text">
              <b className="uauth-org-card__name">{org.name}</b>
              {org.plan && <span className="uauth-org-card__meta">{org.plan}</span>}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default OrgPicker;
