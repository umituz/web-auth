import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthRedirect } from "./AuthRedirect";
import { PasswordLoginPage } from "./PasswordLoginPage";
import type { AuthConfig } from "../types/auth";

const config: AuthConfig = {
  brandName: "Texora",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

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
