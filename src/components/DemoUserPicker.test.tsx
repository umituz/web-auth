import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DemoUserPicker } from "./DemoUserPicker";
import type { DemoUserGroup } from "../types/auth";
import type { DemoUser, Tenant } from "../session/types";

const users: DemoUser[] = [
  { id: "u-ada", name: "Ada Lovelace", role: "owner", orgId: "org-acme" },
  { id: "u-grace", name: "Grace Hopper", role: "creator", orgId: "org-beta" },
  { id: "u-alan", name: "Alan Turing", role: "creator" },
];

const groups: DemoUserGroup[] = [
  { id: "g-owners", title: "Owners", roles: ["owner"] },
  { id: "g-creators", title: "Creators", roles: ["creator"] },
];

const orgs: Tenant[] = [
  { id: "org-acme", name: "Acme Studio" },
  { id: "org-beta", name: "Beta Collective" },
];

const userButton = (name: string | RegExp) => screen.getByRole("button", { name });

describe("DemoUserPicker (single pane)", () => {
  it("keeps the existing behavior: pick reports the user id only", () => {
    const onPick = vi.fn();
    render(<DemoUserPicker users={users} groups={groups} onPick={onPick} />);

    expect(screen.queryByPlaceholderText("Search users…")).toBeNull();
    expect(screen.queryByText("Organization")).toBeNull();

    fireEvent.click(userButton(/ada lovelace/i));

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith("u-ada");
  });
});

describe("DemoUserPicker search", () => {
  it("filters by name case-insensitively", () => {
    render(
      <DemoUserPicker users={users} groups={groups} onPick={vi.fn()} searchable />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search users…"), {
      target: { value: "gRaCe" },
    });

    expect(screen.getByText("Grace Hopper")).toBeTruthy();
    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.queryByText("Alan Turing")).toBeNull();
    expect(screen.queryByText("Owners")).toBeNull();
    expect(screen.getByText("Creators")).toBeTruthy();
  });

  it("filters by role", () => {
    render(
      <DemoUserPicker users={users} groups={groups} onPick={vi.fn()} searchable />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search users…"), {
      target: { value: "owner" },
    });

    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.queryByText("Grace Hopper")).toBeNull();
  });

  it("filters by group title", () => {
    render(
      <DemoUserPicker users={users} groups={groups} onPick={vi.fn()} searchable />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search users…"), {
      target: { value: "creators" },
    });

    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.getByText("Grace Hopper")).toBeTruthy();
    expect(screen.getByText("Alan Turing")).toBeTruthy();
  });

  it("honors a custom filter placeholder", () => {
    render(
      <DemoUserPicker
        users={users}
        groups={groups}
        onPick={vi.fn()}
        searchable
        searchPlaceholder="Filter members"
      />,
    );

    expect(screen.getByPlaceholderText("Filter members")).toBeTruthy();
  });
});

describe("DemoUserPicker two-pane mode", () => {
  it("renders the org row when orgs are provided", () => {
    render(
      <DemoUserPicker users={users} groups={groups} orgs={orgs} onPick={vi.fn()} />,
    );

    expect(screen.getByText("Organization")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Acme Studio" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Beta Collective" })).toBeTruthy();
  });

  it("scopes the user list to the picked org", () => {
    render(
      <DemoUserPicker users={users} groups={groups} orgs={orgs} onPick={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Beta Collective" }));

    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.getByText("Grace Hopper")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Beta Collective" }));

    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("Alan Turing")).toBeTruthy();
  });

  it("returns the persona+org pair through onPickPair", () => {
    const onPickPair = vi.fn();
    render(
      <DemoUserPicker
        users={users}
        groups={groups}
        orgs={orgs}
        onPick={vi.fn()}
        onPickPair={onPickPair}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acme Studio" }));
    fireEvent.click(userButton(/ada lovelace/i));

    expect(onPickPair).toHaveBeenCalledWith({ userId: "u-ada", orgId: "org-acme" });
  });

  it("pairs an unscoped pick with the user's own orgId", () => {
    const onPickPair = vi.fn();
    render(
      <DemoUserPicker
        users={users}
        groups={groups}
        orgs={orgs}
        onPick={vi.fn()}
        onPickPair={onPickPair}
      />,
    );

    fireEvent.click(userButton(/grace hopper/i));

    expect(onPickPair).toHaveBeenCalledWith({ userId: "u-grace", orgId: "org-beta" });
  });

  it("falls back to onPick when onPickPair is absent", () => {
    const onPick = vi.fn();
    render(
      <DemoUserPicker users={users} groups={groups} orgs={orgs} onPick={onPick} />,
    );

    fireEvent.click(userButton(/ada lovelace/i));

    expect(onPick).toHaveBeenCalledWith("u-ada");
  });

  it("combines search with an active org", () => {
    render(
      <DemoUserPicker
        users={[
          { id: "u-ada", name: "Ada Lovelace", role: "owner", orgId: "org-acme" },
          { id: "u-bob", name: "Bob Builder", role: "admin", orgId: "org-acme" },
        ]}
        groups={[
          { id: "g-owners", title: "Owners", roles: ["owner"] },
          { id: "g-admins", title: "Admins", roles: ["admin"] },
        ]}
        orgs={orgs}
        onPick={vi.fn()}
        searchable
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acme Studio" }));
    fireEvent.change(screen.getByPlaceholderText("Search users…"), {
      target: { value: "bob" },
    });

    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.getByText("Bob Builder")).toBeTruthy();
  });
});
