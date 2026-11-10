import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import type { ComponentProps, ReactElement } from "react";
import { LoginForm } from "./LoginForm";
import { PasswordlessForm } from "./PasswordlessForm";
import { RegisterForm } from "./RegisterForm";
import type { AuthConfig } from "../types/auth";

const config: AuthConfig = {
  brandName: "Eduvia",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const user = { id: "u-1", email: "jane@eduvia.io", name: "Jane" };

const statusError = (status: number) =>
  Object.assign(new Error(`request failed with ${status}`), { status });

const routed = (element: ReactElement) => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={element} />
      <Route path="/app" element={<div>app-home</div>} />
      <Route path="/admin" element={<div>admin-home</div>} />
    </Routes>
  </MemoryRouter>
);

const mountRegister = (props: Partial<ComponentProps<typeof RegisterForm>> = {}) =>
  render(
    routed(
      <RegisterForm
        config={config}
        showTerms={false}
        showLoginLink={false}
        showSocialLogin={false}
        requirePasswordConfirm={false}
        onRegisterAttempt={vi.fn().mockResolvedValue(user)}
        {...props}
      />,
    ),
  );

const fillRegister = (name = "Jane") => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "jane@eduvia.io" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "longenough1" },
  });
};

describe("PasswordlessForm extensions", () => {
  it("prefills and focuses the email from defaultEmail with autoFocusEmail", () => {
    render(
      <PasswordlessForm
        config={config}
        defaultEmail="owner@eduvia.io"
        autoFocusEmail
        onPasswordlessLogin={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("you@example.com");
    expect(input).toHaveProperty("value", "owner@eduvia.io");
    expect(document.activeElement).toBe(input);
  });

  it("reports every keystroke through onEmailChange", () => {
    const onEmailChange = vi.fn();
    render(
      <PasswordlessForm
        config={config}
        onEmailChange={onEmailChange}
        onPasswordlessLogin={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "staff@eduvia.io" },
    });

    expect(onEmailChange).toHaveBeenCalledWith("staff@eduvia.io");
  });

  it("freezes the whole form while disabled", () => {
    const onPasswordlessLogin = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordlessForm
        config={config}
        disabled
        defaultEmail="staff@eduvia.io"
        demoAccounts={[
          { id: "demo-admin", email: "admin@eduvia.io", label: "Demo admin" },
        ]}
        onPasswordlessLogin={onPasswordlessLogin}
      />,
    );

    expect(screen.getByPlaceholderText("you@example.com")).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: /demo admin/i })).toHaveProperty(
      "disabled",
      true,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Continue" }).closest("form")!);
    expect(onPasswordlessLogin).not.toHaveBeenCalled();
  });

  it("maps error statuses through statusKeys", async () => {
    render(
      <PasswordlessForm
        config={config}
        defaultEmail="staff@eduvia.io"
        onPasswordlessLogin={vi.fn().mockRejectedValue(statusError(429))}
        statusKeys={{ 429: "auth.magicLink.loginFailed" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Sign-in failed"));
  });

  it("shows demo account meta when provided and the email otherwise", () => {
    render(
      <PasswordlessForm
        config={config}
        demoAccounts={[
          { id: "demo-owner", email: "owner@eduvia.io", label: "Owner", meta: "Full access workspace" },
          { id: "demo-admin", email: "admin@eduvia.io", label: "Admin" },
        ]}
        onPasswordlessLogin={vi.fn()}
      />,
    );

    expect(screen.getByText("Full access workspace")).toBeTruthy();
    expect(screen.getByText("admin@eduvia.io")).toBeTruthy();
  });

  it("broadcasts busy transitions through onBusyChange", async () => {
    let release!: (value: undefined) => void;
    const gate = new Promise<undefined>((resolve) => {
      release = resolve;
    });
    const onBusyChange = vi.fn();

    render(
      <PasswordlessForm
        config={config}
        defaultEmail="staff@eduvia.io"
        onPasswordlessLogin={vi.fn().mockReturnValue(gate)}
        onBusyChange={onBusyChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(onBusyChange).toHaveBeenCalledWith(true));
    release(undefined);
    await waitFor(() => expect(onBusyChange).toHaveBeenCalledWith(false));
  });
});

describe("RegisterForm extensions", () => {
  it("requires a name when requireName is set", async () => {
    const onRegisterAttempt = vi.fn().mockResolvedValue(user);
    mountRegister({ requireName: true, onRegisterAttempt });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@eduvia.io" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "longenough1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(onRegisterAttempt).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Name is required.");
  });

  it("renders field hints next to the built-in fields", () => {
    mountRegister({
      fieldHints: {
        name: "Shown on your public profile",
        email: "Use your work email",
        password: "At least 10 characters",
      },
    });

    expect(screen.getByText("Shown on your public profile")).toBeTruthy();
    expect(screen.getByText("Use your work email")).toBeTruthy();
    expect(screen.getByText("At least 10 characters")).toBeTruthy();
  });

  it("routes through afterLoginRouteFor when it returns a target", async () => {
    mountRegister({
      onRegisterAttempt: vi.fn().mockResolvedValue(user),
      config: { ...config, afterLoginRouteFor: () => "/admin" },
    });

    fillRegister();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(screen.getByText("admin-home")).toBeTruthy());
    expect(screen.queryByText("app-home")).toBeNull();
  });

  it("maps error statuses through statusKeys", async () => {
    mountRegister({
      onRegisterAttempt: vi.fn().mockRejectedValue(statusError(400)),
      statusKeys: { 400: "auth.register.mustAcceptTerms" },
    });

    fillRegister();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "You must accept the terms to continue",
      ),
    );
  });
});

describe("LoginForm extensions", () => {
  const mountLogin = (props: Partial<ComponentProps<typeof LoginForm>> = {}) =>
    render(
      routed(
        <LoginForm
          config={config}
          showRememberMe={false}
          showForgotPassword={false}
          showRegisterLink={false}
          showSocialLogin={false}
          onLoginAttempt={vi.fn().mockResolvedValue(user)}
          {...props}
        />,
      ),
    );

  const fillLogin = () => {
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@eduvia.io" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "longenough1" },
    });
  };

  it("routes through afterLoginRouteFor per user", async () => {
    mountLogin({
      config: {
        ...config,
        afterLoginRouteFor: (u) => (u.name === "Jane" ? "/admin" : "/app"),
      },
      navigateOptions: { replace: true },
    });

    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(screen.getByText("admin-home")).toBeTruthy());
  });

  it("keeps the default 401 wording and lets statusKeys override 403", async () => {
    const { unmount } = mountLogin({
      onLoginAttempt: vi.fn().mockRejectedValue(statusError(401)),
    });
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("Incorrect email or password."),
    );
    unmount();

    mountLogin({
      onLoginAttempt: vi.fn().mockRejectedValue(statusError(403)),
      statusKeys: { 403: "auth.magicLink.loginFailed" },
    });
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("Sign-in failed"),
    );
  });
});

describe("AuthErrorBanner message handling", () => {
  it("renders multi-sentence server messages verbatim", async () => {
    render(
      <PasswordlessForm
        config={config}
        defaultEmail="staff@eduvia.io"
        onPasswordlessLogin={vi
          .fn()
          .mockRejectedValue(new Error("Your trial has ended. Please contact support."))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Your trial has ended. Please contact support.",
      ),
    );
  });

  it("still translates dot-namespaced keys without spaces", async () => {
    render(
      <PasswordlessForm
        config={config}
        defaultEmail="staff@eduvia.io"
        onPasswordlessLogin={vi.fn().mockRejectedValue(new Error("auth.validation.nameRequired"))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Name is required."));
  });
});
