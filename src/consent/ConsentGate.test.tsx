import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SessionProvider } from "../session";
import type { AuthAdapter, SessionUser } from "../session";
import { ConsentGate } from "./ConsentGate";
import type { ConsentFetchJson } from "./service";

const user: SessionUser = { id: "u1", email: "u1@test.dev", name: "User One" } as SessionUser;

const anonymousAdapter = (): AuthAdapter => ({
  login: vi.fn(),
  logout: vi.fn(),
  current: vi.fn().mockResolvedValue(null),
  demoLogin: vi.fn(),
});

const authenticatedAdapter = (): AuthAdapter => ({
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  current: vi.fn().mockResolvedValue(user),
  demoLogin: vi.fn(),
});

function consentResponse(consent: unknown): ConsentFetchJson {
  return vi.fn((path: string) => {
    if (path === "/api/auth/consent") return Promise.resolve(consent);
    return Promise.reject(new Error(`unexpected ${path}`));
  });
}

describe("ConsentGate", () => {
  it("renders children for anonymous visitors without touching the consent api", async () => {
    const fetchJson = vi.fn();
    render(
      <SessionProvider adapter={anonymousAdapter()}>
        <ConsentGate termsVersion="2026.11" fetchJson={fetchJson}>
          <p>app content</p>
        </ConsentGate>
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByText("app content")).toBeTruthy());
    expect(fetchJson).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders children when the accepted version is current", async () => {
    const fetchJson = consentResponse({
      consent: { id: "c1", version: "2026.11", termsAccepted: true, kvkkAccepted: true, marketingAccepted: false },
    });
    render(
      <SessionProvider adapter={authenticatedAdapter()}>
        <ConsentGate termsVersion="2026.11" fetchJson={fetchJson}>
          <p>app content</p>
        </ConsentGate>
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByText("app content")).toBeTruthy());
    expect(fetchJson).toHaveBeenCalledWith("/api/auth/consent");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("blocks an authenticated user whose consent is missing", async () => {
    const fetchJson = consentResponse({ consent: null });
    render(
      <SessionProvider adapter={authenticatedAdapter()}>
        <ConsentGate termsVersion="2026.11" fetchJson={fetchJson}>
          <p>app content</p>
        </ConsentGate>
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.queryByText("app content")).toBeNull();
  });

  it("unblocks after the user confirms consent", async () => {
    const fetchJson = vi.fn((path: string, init?: { method?: string; json?: unknown }) => {
      if (path === "/api/auth/consent" && !init?.method) {
        return Promise.resolve({ consent: null });
      }
      if (path === "/api/auth/consent" && init?.method === "POST") {
        return Promise.resolve({
          id: "c2",
          version: "2026.11",
          termsAccepted: true,
          kvkkAccepted: true,
          marketingAccepted: false,
        });
      }
      return Promise.reject(new Error(`unexpected ${path}`));
    });
    render(
      <SessionProvider adapter={authenticatedAdapter()}>
        <ConsentGate termsVersion="2026.11" fetchJson={fetchJson}>
          <p>app content</p>
        </ConsentGate>
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    await screen.getByLabelText("Kullanım Koşulları Onayı").click();
    await screen.getByLabelText("KVKK ve Gizlilik Onayı").click();
    const submit = screen.getByRole("button", { name: /accept and continue|confirm|onayla/i }) as HTMLButtonElement;
    await submit.click();

    await waitFor(() => expect(screen.getByText("app content")).toBeTruthy());
  });

  it("uses DEFAULT_TERMS_VERSION when termsVersion prop is omitted", async () => {
    const fetchJson = consentResponse({
      consent: { id: "c-def", version: "2026-11-20", termsAccepted: true, kvkkAccepted: true, marketingAccepted: false },
    });
    render(
      <SessionProvider adapter={authenticatedAdapter()}>
        <ConsentGate fetchJson={fetchJson}>
          <p>app content default version</p>
        </ConsentGate>
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByText("app content default version")).toBeTruthy());
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
