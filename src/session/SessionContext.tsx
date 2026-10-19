/**
 * Session context — user + active tenant state over an injected
 * AuthAdapter. Restores the current user on mount, exposes
 * login/logout/demoLogin, loads tenants for the user and keeps an
 * `activeTenant` the OrgSwitcher drives via `switchTenant`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthAdapter,
  LoginCredentials,
  SessionStatus,
  SessionUser,
  Tenant,
} from "./types";

export interface SessionProviderProps {
  adapter: AuthAdapter;
  children: ReactNode;
}

interface SessionContextValue {
  user: SessionUser | null;
  tenants: Tenant[];
  activeTenant: Tenant | null;
  status: SessionStatus;
  login: (credentials: LoginCredentials) => Promise<SessionUser>;
  logout: () => Promise<void>;
  demoLogin: (userId: string) => Promise<SessionUser>;
  switchTenant: (tenantId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ adapter, children }: SessionProviderProps) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  // Restore the session once on mount.
  useEffect(() => {
    let cancelled = false;
    adapter
      .current()
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus(current ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (!cancelled) setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  // Load tenants whenever the authenticated user changes.
  useEffect(() => {
    if (!user || !adapter.listTenants) {
      setTenants([]);
      setActiveTenantId(null);
      return;
    }
    let cancelled = false;
    adapter
      .listTenants(user.id)
      .then((list) => {
        if (cancelled) return;
        setTenants(list);
        setActiveTenantId((prev) =>
          prev && list.some((tenant) => tenant.id === prev) ? prev : (list[0]?.id ?? null),
        );
      })
      .catch(() => {
        if (!cancelled) setTenants([]);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, user]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const next = await adapter.login(credentials);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [adapter],
  );

  const logout = useCallback(async () => {
    await adapter.logout();
    setUser(null);
    setStatus("anonymous");
  }, [adapter]);

  const demoLogin = useCallback(
    async (userId: string) => {
      if (!adapter.demoLogin) {
        throw new Error("AuthAdapter does not support demoLogin");
      }
      const next = await adapter.demoLogin(userId);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [adapter],
  );

  const switchTenant = useCallback((tenantId: string) => {
    setActiveTenantId(tenantId);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      tenants,
      activeTenant: tenants.find((tenant) => tenant.id === activeTenantId) ?? null,
      status,
      login,
      logout,
      demoLogin,
      switchTenant,
    }),
    [user, tenants, activeTenantId, status, login, logout, demoLogin, switchTenant],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession requires a <SessionProvider> ancestor");
  }
  return context;
};
