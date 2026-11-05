
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  initials?: string;
  plan?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface MagicLinkResult {
  sent: boolean;
  link?: string;
}

import type { LoginCredentials } from "../types/auth";

export type { LoginCredentials };

export interface AuthAdapter {
  login(credentials: LoginCredentials): Promise<SessionUser>;
  logout(): Promise<void>;
  current(): Promise<SessionUser | null>;
  listTenants?(userId: string): Promise<Tenant[]>;
  demoLogin?(userId: string): Promise<SessionUser>;
  requestMagicLink?(email: string): Promise<MagicLinkResult>;
  verifyToken?(token: string): Promise<SessionUser>;
  listDemoUsers?(): Promise<DemoUser[]>;
}

export type SessionStatus = "loading" | "authenticated" | "anonymous";
