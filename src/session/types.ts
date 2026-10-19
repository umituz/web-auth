/**
 * Session model — the host-facing auth contract.
 *
 * The package performs no authentication itself; hosts adapt their
 * provider (Firebase, Supabase, NEON-backed REST, mock...) to this
 * interface and hand it to <SessionProvider>.
 */

/** Authenticated user as the dashboard presents it. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** Host role key — pairs with the permissions matrix. */
  role: string;
  avatarUrl?: string;
}

/** Tenant/organization the user may switch between. */
export interface Tenant {
  id: string;
  name: string;
  /** Short initials for avatar-style rendering. */
  initials?: string;
  /** Optional plan badge (e.g. "starter" | "growth" | "enterprise"). */
  plan?: string;
}

import type { LoginCredentials } from "../types/auth";

export type { LoginCredentials };

/**
 * Auth adapter seam. `login`/`logout`/`current` are required;
 * `listTenants` and `demoLogin` power the multi-tenant switcher and
 * one-click demo entry when the host supports them.
 */
export interface AuthAdapter {
  login(credentials: LoginCredentials): Promise<SessionUser>;
  logout(): Promise<void>;
  current(): Promise<SessionUser | null>;
  listTenants?(userId: string): Promise<Tenant[]>;
  demoLogin?(userId: string): Promise<SessionUser>;
}

export type SessionStatus = "loading" | "authenticated" | "anonymous";
