import type { ConsentPayload } from "../components";

export interface ConsentRecord {
  id: string;
  userId: string;
  termsAccepted: boolean;
  kvkkAccepted: boolean;
  marketingAccepted: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SessionEntry {
  id: string;
  token?: string;
  isCurrent?: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface ConsentClient {
  fetchLatestConsent: () => Promise<{ consent: ConsentRecord | null }>;
  recordConsent: (payload: ConsentPayload) => Promise<ConsentRecord>;
  fetchActiveSessions: () => Promise<{ sessions: SessionEntry[] }>;
  revokeSession: (token: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
}

export type ConsentFetchJson = (
  path: string,
  init?: { method?: string; json?: unknown },
) => Promise<unknown>;

export interface ConsentClientOptions {
  basePath?: string;
  fetchJson?: ConsentFetchJson;
}

const DEFAULT_BASE_PATH = "/api/auth";

async function defaultFetchJson(
  path: string,
  init?: { method?: string; json?: unknown },
): Promise<unknown> {
  const hasBody = init?.json !== undefined;
  const res = await fetch(path, {
    method: init?.method ?? "GET",
    headers: hasBody
      ? { accept: "application/json", "content-type": "application/json" }
      : { accept: "application/json" },
    body: hasBody ? JSON.stringify(init?.json) : undefined,
    credentials: "same-origin",
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data as { message?: string; error?: string } | null;
    const message =
      detail?.message ?? detail?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

type WireSession = { id: string } & {
  [K in Exclude<keyof SessionEntry, "id">]: SessionEntry[K] | null;
};

export function createConsentClient(
  options: ConsentClientOptions = {},
): ConsentClient {
  const base = options.basePath ?? DEFAULT_BASE_PATH;
  const fetchJson = options.fetchJson ?? defaultFetchJson;

  return {
    fetchLatestConsent: () =>
      fetchJson(`${base}/consent`) as Promise<{ consent: ConsentRecord | null }>,

    recordConsent: (payload) =>
      fetchJson(`${base}/consent`, { method: "POST", json: payload }) as Promise<ConsentRecord>,

    fetchActiveSessions: async () => {
      const data = (await fetchJson(`${base}/sessions`)) as { sessions: WireSession[] };
      const clean = <T>(value: T | null) => (value === null ? undefined : value);
      return {
        sessions: data.sessions.map((row) => ({
          id: row.id,
          token: clean(row.token),
          isCurrent: clean(row.isCurrent),
          userAgent: clean(row.userAgent),
          ipAddress: clean(row.ipAddress),
          createdAt: clean(row.createdAt),
          expiresAt: clean(row.expiresAt),
        })),
      };
    },

    revokeSession: (token) =>
      fetchJson(`${base}/revoke-session`, { method: "POST", json: { token } }) as Promise<void>,

    revokeOtherSessions: () =>
      fetchJson(`${base}/revoke-other-sessions`, {
        method: "POST",
        json: {},
      }) as Promise<void>,
  };
}
