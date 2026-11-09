import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PasswordlessForm } from "./PasswordlessForm";
import type { AuthConfig } from "../types/auth";

const config: AuthConfig = {
  brandName: "Servixa",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const typeEmail = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
    target: { value },
  });
};

describe("PasswordlessForm", () => {
  it("calls onPasswordlessLogin with the entered email on submit", async () => {
    const onPasswordlessLogin = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordlessForm config={config} onPasswordlessLogin={onPasswordlessLogin} />,
    );

    typeEmail("staff@servixa.io");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(onPasswordlessLogin).toHaveBeenCalledWith("staff@servixa.io"),
    );
  });

  it("rejects a malformed email without calling the callback", () => {
    const onPasswordlessLogin = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordlessForm config={config} onPasswordlessLogin={onPasswordlessLogin} />,
    );

    typeEmail("not-an-email");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(onPasswordlessLogin).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Enter a valid email address.");
  });

  it("renders the brand subtitle by default and the description override when given", () => {
    const { unmount } = render(
      <PasswordlessForm config={config} onPasswordlessLogin={vi.fn()} />,
    );
    expect(
      screen.getByText("Sign in to Servixa with just your email — no password needed."),
    ).toBeTruthy();
    unmount();

    render(
      <PasswordlessForm
        config={config}
        description="Staff quick access"
        onPasswordlessLogin={vi.fn()}
      />,
    );
    expect(screen.getByText("Staff quick access")).toBeTruthy();
  });

  it("signs in straight from a demo account button", async () => {
    const onPasswordlessLogin = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordlessForm
        config={config}
        onPasswordlessLogin={onPasswordlessLogin}
        demoAccounts={[
          { id: "demo-admin", email: "admin@servixa.io", label: "Demo admin" },
          { id: "demo-staff", email: "staff@servixa.io", label: "Demo staff" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /demo admin/i }));

    await waitFor(() =>
      expect(onPasswordlessLogin).toHaveBeenCalledWith("admin@servixa.io"),
    );
  });

  it("surfaces the failure key when the callback rejects", async () => {
    const onLoginError = vi.fn();
    render(
      <PasswordlessForm
        config={config}
        onPasswordlessLogin={vi.fn().mockRejectedValue(new Error("boom"))}
        onLoginError={onLoginError}
      />,
    );

    typeEmail("staff@servixa.io");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(onLoginError).toHaveBeenCalled());
    expect(screen.getByRole("alert").textContent).toBe("boom");
  });
});
