import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthLayout } from "./AuthLayout";
import type { AuthConfig, LocaleOption } from "../types/auth";

const config: AuthConfig = {
  brandName: "Texora",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const locales: LocaleOption[] = [
  { value: "en", label: "EN" },
  { value: "tr", label: "TR" },
  { value: "de", label: "DE" },
];

describe("AuthLayout localeSwitcher", () => {
  it("renders a segmented control for the configured locales", () => {
    render(
      <AuthLayout
        config={config}
        localeSwitcher={{ locales, value: "en", onChange: vi.fn() }}
      >
        <p>Card body</p>
      </AuthLayout>,
    );

    expect(screen.getByRole("group")).toBeTruthy();
    expect(screen.getByRole("button", { name: "EN" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "TR" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "DE" })).toBeTruthy();
  });

  it("marks only the active locale as pressed", () => {
    render(
      <AuthLayout
        config={config}
        localeSwitcher={{ locales, value: "tr", onChange: vi.fn() }}
      >
        <p>Card body</p>
      </AuthLayout>,
    );

    expect(screen.getByRole("button", { name: "TR" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "EN" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "DE" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("reports the picked locale through onChange", () => {
    const onChange = vi.fn();
    render(
      <AuthLayout
        config={config}
        localeSwitcher={{ locales, value: "en", onChange }}
      >
        <p>Card body</p>
      </AuthLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "DE" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("de");
  });

  it("renders no switcher when the prop is absent", () => {
    render(<AuthLayout config={config}>Card body</AuthLayout>);

    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("button", { name: "TR" })).toBeNull();
  });
});
