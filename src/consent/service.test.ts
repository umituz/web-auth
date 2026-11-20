import { describe, expect, it, vi } from "vitest";
import { createConsentClient } from "./service";

describe("createConsentClient", () => {
  it("reads the latest consent record", async () => {
    const fetchJson = vi.fn().mockResolvedValue({ consent: { id: "c1", version: "2026.11" } });
    const client = createConsentClient({ fetchJson });

    const result = await client.fetchLatestConsent();

    expect(fetchJson).toHaveBeenCalledWith("/api/auth/consent");
    expect(result.consent).toMatchObject({ id: "c1", version: "2026.11" });
  });

  it("posts a consent payload", async () => {
    const fetchJson = vi.fn().mockResolvedValue({ id: "c1" });
    const client = createConsentClient({ fetchJson });

    await client.recordConsent({
      termsAccepted: true,
      kvkkAccepted: true,
      marketingAccepted: false,
      version: "2026.11",
    });

    expect(fetchJson).toHaveBeenCalledWith("/api/auth/consent", {
      method: "POST",
      json: {
        termsAccepted: true,
        kvkkAccepted: true,
        marketingAccepted: false,
        version: "2026.11",
      },
    });
  });

  it("normalizes null session fields to undefined", async () => {
    const fetchJson = vi.fn().mockResolvedValue({
      sessions: [
        { id: "s1", token: "tok", isCurrent: true, userAgent: null, ipAddress: null, createdAt: null, expiresAt: null },
      ],
    });
    const client = createConsentClient({ fetchJson });

    const { sessions } = await client.fetchActiveSessions();

    expect(sessions[0]).toEqual({
      id: "s1",
      token: "tok",
      isCurrent: true,
      userAgent: undefined,
      ipAddress: undefined,
      createdAt: undefined,
      expiresAt: undefined,
    });
  });

  it("honors a custom base path", async () => {
    const fetchJson = vi.fn().mockResolvedValue({ sessions: [] });
    const client = createConsentClient({ basePath: "/api/v2/auth", fetchJson });

    await client.fetchActiveSessions();

    expect(fetchJson).toHaveBeenCalledWith("/api/v2/auth/sessions");
  });

  it("revokes one session and all others through the auth endpoints", async () => {
    const fetchJson = vi.fn().mockResolvedValue(undefined);
    const client = createConsentClient({ fetchJson });

    await client.revokeSession("tok");
    await client.revokeOtherSessions();

    expect(fetchJson).toHaveBeenNthCalledWith(1, "/api/auth/revoke-session", {
      method: "POST",
      json: { token: "tok" },
    });
    expect(fetchJson).toHaveBeenNthCalledWith(2, "/api/auth/revoke-other-sessions", {
      method: "POST",
      json: {},
    });
  });
});
