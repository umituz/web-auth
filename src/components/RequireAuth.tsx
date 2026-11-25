import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "../session";

export interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  loginRoute?: string;
  isAuthenticated?: boolean;
  loading?: boolean;
}

export function RequireAuth({
  children,
  fallback = null,
  loginRoute = "/login",
  isAuthenticated,
  loading,
}: RequireAuthProps) {
  let pathname = "/";
  try {
    pathname = useLocation().pathname;
  } catch {
    pathname = "/";
  }

  let authed = isAuthenticated;
  let isLoading = loading;

  if (authed === undefined || isLoading === undefined) {
    try {
      const session = useSession();
      if (authed === undefined) {
        authed = Boolean(session.user);
      }
      if (isLoading === undefined) {
        isLoading = !session.ready;
      }
    } catch {
      if (authed === undefined) {
        authed = false;
      }
      if (isLoading === undefined) {
        isLoading = false;
      }
    }
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!authed) {
    return <Navigate to={loginRoute} state={{ from: pathname }} replace />;
  }

  return <>{children}</>;
}
