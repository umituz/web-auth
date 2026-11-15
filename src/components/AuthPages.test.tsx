import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthRedirect } from "./AuthRedirect";
import { DemoLoginPage } from "./DemoLoginPage";
import { PasswordLoginPage } from "./PasswordLoginPage";
import type { AuthConfig, DemoUserGroup } from "../types/auth";
import type { DemoUser } from "../session/types";

const config: AuthConfig = {
  brandName: "Texora",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const users: DemoUser[] = [
  { id: "u-ada", name: "Ada Lovelace", role: "owner", orgId: "org-acme" },
  { id: "u-grace", name: "Grace Hopper", role: "creator", orgId: "org-acme" },
];

const groups: DemoUserGroup[] = [
  { id: "g-owners", title: "Owners", roles: ["owner"] },
  { id: "g-creators", title: "Creators", roles: ["creator"] },
];

const routed = (ui: React.ReactElement, path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/app" element={<p>app-home</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("AuthRedirect", () => {
  it("renders nothing when the condition is false", () => {
    const { container } = render(<AuthRedirect when={false} to="/app" />);
    expect(container.innerHTML).toBe("");
  });

  it("navigates when the condition is true", () => {
    routed(<AuthRedirect when={true} to="/app" />);
    expect(screen.getByText("app-home")).toBeTruthy();
  });
});

describe("DemoLoginPage", () => {
  it("redirects authenticated visitors to the after-login route", () => {
    routed(<DemoLoginPage config={config} users={users} groups={groups} onPick={vi.fn()} isAuthenticated />);
    expect(screen.getByText("app-home")).toBeTruthy();
  });

  it("renders the picker once ready and reports the picked user", () => {
    const onPick = vi.fn();
    routed(
      <DemoLoginPage config={config} users={users} groups={groups} onPick={onPick} title="Pick a demo user" />,
    );

    expect(screen.getByText("Pick a demo user")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /ada lovelace/i }));
    expect(onPick).toHaveBeenCalledWith("u-ada");
  });

  it("hides the picker while not ready", () => {
    routed(<DemoLoginPage config={config} users={users} groups={groups} onPick={vi.fn()} ready={false} />);
    expect(screen.queryByRole("button", { name: /ada lovelace/i })).toBeNull();
  });

  it("surfaces a banner when the sign-in handler rejects", async () => {
    routed(
      <DemoLoginPage
        config={config}
        users={users}
        groups={groups}
        onPick={vi.fn().mockRejectedValue(new Error("boom"))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ada lovelace/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent).toMatch(/sign-in failed/i);
  });
});

describe("PasswordLoginPage", () => {
  it("redirects authenticated visitors to the after-login route", () => {
    routed(<PasswordLoginPage config={config} isAuthenticated />);
    expect(screen.getByText("app-home")).toBeTruthy();
  });

  it("renders the login form by default with its own register link", () => {
    routed(<PasswordLoginPage config={config} />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByText("Sign up")).toBeTruthy();
  });

  it("toggles between login and register modes", () => {
    routed(<PasswordLoginPage config={config} allowRegister />);

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    expect(screen.getByRole("button", { name: /create account/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
  });
});
