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
  DemoUser,
  LoginCredentials,
  MagicLinkResult,
  SessionStatus,
  SessionUser,
  Tenant,
} from "./types";

export interface SessionProviderProps<U extends SessionUser = SessionUser, T extends Tenant = Tenant> {
  adapter: AuthAdapter<U, T>;
  children: ReactNode;
}

export interface SessionContextValue<U extends SessionUser = SessionUser, T extends Tenant = Tenant> {
  user: U | null;
  tenants: T[];
  activeTenant: T | null;
  status: SessionStatus;
  ready: boolean;
  login: (credentials: LoginCredentials) => Promise<U>;
  logout: () => Promise<void>;
  demoLogin: (userId: string) => Promise<U>;
  requestMagicLink: (email: string) => Promise<MagicLinkResult>;
  verifyToken: (token: string) => Promise<U>;
  listDemoUsers: () => Promise<DemoUser[]>;
  switchTenant: (tenantId: string) => void;
}

const SessionContext = createContext<SessionContextValue<any, any> | null>(null);

export const SessionProvider = <U extends SessionUser = SessionUser, T extends Tenant = Tenant>({
  adapter,
  children,
}: SessionProviderProps<U, T>) => {
  const [user, setUser] = useState<U | null>(null);
  const [tenants, setTenants] = useState<T[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

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

  const requestMagicLink = useCallback(
    async (email: string) => {
      if (!adapter.requestMagicLink) {
        throw new Error("AuthAdapter does not support requestMagicLink");
      }
      return adapter.requestMagicLink(email);
    },
    [adapter],
  );

  const verifyToken = useCallback(
    async (token: string) => {
      if (!adapter.verifyToken) {
        throw new Error("AuthAdapter does not support verifyToken");
      }
      const next = await adapter.verifyToken(token);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [adapter],
  );

  const listDemoUsers = useCallback(async () => {
    if (!adapter.listDemoUsers) {
      throw new Error("AuthAdapter does not support listDemoUsers");
    }
    return adapter.listDemoUsers();
  }, [adapter]);

  const value = useMemo<SessionContextValue<U, T>>(
    () => ({
      user,
      tenants,
      activeTenant: tenants.find((tenant) => tenant.id === activeTenantId) ?? null,
      status,
      ready: status !== "loading",
      login,
      logout,
      demoLogin,
      requestMagicLink,
      verifyToken,
      listDemoUsers,
      switchTenant,
    }),
    [
      user,
      tenants,
      activeTenantId,
      status,
      login,
      logout,
      demoLogin,
      requestMagicLink,
      verifyToken,
      listDemoUsers,
      switchTenant,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = <U extends SessionUser = SessionUser, T extends Tenant = Tenant>(): SessionContextValue<U, T> => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession requires a <SessionProvider> ancestor");
  }
  return context as unknown as SessionContextValue<U, T>;
};
