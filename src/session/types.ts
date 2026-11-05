
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

import type { LoginCredentials } from "../types/auth";

export type { LoginCredentials };

export interface AuthAdapter {
  login(credentials: LoginCredentials): Promise<SessionUser>;
  logout(): Promise<void>;
  current(): Promise<SessionUser | null>;
  listTenants?(userId: string): Promise<Tenant[]>;
  demoLogin?(userId: string): Promise<SessionUser>;
}

export type SessionStatus = "loading" | "authenticated" | "anonymous";
