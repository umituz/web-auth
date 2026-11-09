import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { OrgPicker } from "./OrgPicker";
import type { AuthConfig } from "../types/auth";
import type { Tenant } from "../session/types";

const config: AuthConfig = {
  brandName: "Texora",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const orgs: Tenant[] = [
  { id: "org-acme", name: "Acme Studio", plan: "pro" },
  { id: "org-beta", name: "Beta Collective" },
];

describe("OrgPicker", () => {
  it("renders one card per org with the default heading", () => {
    render(<OrgPicker config={config} orgs={orgs} onPick={vi.fn()} />);

    expect(screen.getByText("Choose an organization")).toBeTruthy();
    expect(screen.getByRole("button", { name: /acme studio/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /beta collective/i })).toBeTruthy();
  });

  it("prefers a custom title when provided", () => {
    render(
      <OrgPicker config={config} orgs={orgs} onPick={vi.fn()} title="Pick your workspace" />,
    );

    expect(screen.getByText("Pick your workspace")).toBeTruthy();
    expect(screen.queryByText("Choose an organization")).toBeNull();
  });

  it("calls onPick with the picked org id", () => {
    const onPick = vi.fn();
    render(<OrgPicker config={config} orgs={orgs} onPick={onPick} />);

    fireEvent.click(screen.getByRole("button", { name: /beta collective/i }));

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith("org-beta");
  });

  it("renders nothing without orgs", () => {
    const { container } = render(
      <OrgPicker config={config} orgs={[]} onPick={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });
});
