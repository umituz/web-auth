import type { ReactNode } from "react";
import { RestrictedNotice } from "./RestrictedNotice";

export interface AuthGateProps {
  children: ReactNode;
  allowed?: boolean;
  permission?: string;
  requiredRole?: string | readonly string[];
  userRole?: string;
  fallback?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}

export function AuthGate({
  children,
  allowed,
  permission,
  requiredRole,
  userRole,
  fallback,
  title,
  description,
}: AuthGateProps) {
  let isAllowed = allowed;
  if (isAllowed === undefined && requiredRole && userRole) {
    if (Array.isArray(requiredRole)) {
      isAllowed = requiredRole.includes(userRole);
    } else {
      isAllowed = userRole === requiredRole;
    }
  }

  if (isAllowed === false) {
    return (
      <>
        {fallback ?? (
          <RestrictedNotice
            title={title}
            description={description}
            permission={permission}
            requiredRole={typeof requiredRole === "string" ? requiredRole : undefined}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}
