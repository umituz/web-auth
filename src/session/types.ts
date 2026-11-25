import type { LoginCredentials } from "../types/auth";

export type { LoginCredentials };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export interface Tenant {
  id: string;
  name: string;
  initials?: string;
  plan?: string;
  [key: string]: unknown;
}

export interface DemoUser {
  id: string;
  name: string;
  role: string;
  email?: string;
  orgId?: string;
}

export interface MagicLinkResult {
  sent: boolean;
  link?: string;
}

export interface AuthAdapter<U extends SessionUser = SessionUser, T extends Tenant = Tenant> {
  login(credentials: LoginCredentials): Promise<U>;
  logout(): Promise<void>;
  current(): Promise<U | null>;
  listTenants?(userId: string): Promise<T[]>;
  demoLogin?(userId: string): Promise<U>;
  requestMagicLink?(email: string): Promise<MagicLinkResult>;
  verifyToken?(token: string): Promise<U>;
  listDemoUsers?(): Promise<DemoUser[]>;
}

export type SessionStatus = "loading" | "authenticated" | "anonymous";
