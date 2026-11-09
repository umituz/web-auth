import { useState } from "react";
import { Avatar } from "@umituz/web-design-system/molecules";
import { Button, Input } from "@umituz/web-design-system/atoms";
import { cn } from "@umituz/web-design-system/utils/cn";
import { groupDemoUsers } from "../utils/auth";
import type { DemoUserPickerProps, DemoUserGroup } from "../types/auth";
import type { DemoUser } from "../session/types";

export const DemoUserPicker = ({
  users,
  groups,
  onPick,
  searchable = false,
  searchPlaceholder = "Search users…",
  orgs,
  onPickPair,
}: DemoUserPickerProps) => {
  const [query, setQuery] = useState("");
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const orgList = orgs ?? [];
  const twoPane = orgList.length > 0;

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (user: DemoUser, group: DemoUserGroup): boolean =>
    normalizedQuery.length === 0 ||
    user.name.toLowerCase().includes(normalizedQuery) ||
    user.role.toLowerCase().includes(normalizedQuery) ||
    group.title.toLowerCase().includes(normalizedQuery);

  const scoped = twoPane && activeOrgId
    ? users.filter((user) => user.orgId === activeOrgId)
    : users;

  const visible = groupDemoUsers(scoped, groups)
    .map((group) => ({
      ...group,
      users: group.users.filter((user) => matchesQuery(user, group)),
    }))
    .filter((group) => group.users.length > 0);

  const pickUser = (user: DemoUser) => {
    if (twoPane && onPickPair) {
      void onPickPair({ userId: user.id, orgId: user.orgId ?? activeOrgId ?? undefined });
      return;
    }
    void onPick(user.id);
  };

  return (
    <>
      {searchable && (
        <div className="uauth-demo-search">
          <Input
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {twoPane && (
        <section className="uauth-demo-section">
          <h2 className="uauth-demo-title">Organization</h2>
          <div className="uauth-demo-orgs">
            {orgList.map((org) => (
              <button
                key={org.id}
                type="button"
                className={cn(
                  "uauth-demo-org",
                  org.id === activeOrgId && "uauth-demo-org--active",
                )}
                aria-pressed={org.id === activeOrgId}
                onClick={() =>
                  setActiveOrgId((prev) => (prev === org.id ? null : org.id))
                }
              >
                {org.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {visible.map((group) => (
        <section key={group.id} className="uauth-demo-section">
          <h2 className="uauth-demo-title">{group.title}</h2>
          <div className="uauth-demo-users">
            {group.users.map((user) => (
              <Button
                key={user.id}
                type="button"
                variant="secondary"
                className="uauth-demo-user"
                onClick={() => pickUser(user)}
              >
                <Avatar name={user.name} size="sm" />
                <span className="uauth-demo-user-text">
                  <b className="uauth-demo-user-name">{user.name}</b>
                  <span className="uauth-demo-user-meta">
                    {group.roleLabels?.[user.role] ?? user.role}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

export default DemoUserPicker;
