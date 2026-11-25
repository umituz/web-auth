import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGate } from "./AuthGate";

describe("AuthGate", () => {
  it("renders children when allowed is true", () => {
    render(
      <AuthGate allowed={true}>
        <div>Authorized View</div>
      </AuthGate>,
    );
    expect(screen.getByText("Authorized View")).toBeTruthy();
  });

  it("renders RestrictedNotice when allowed is false", () => {
    render(
      <AuthGate allowed={false} permission="users.manage">
        <div>Authorized View</div>
      </AuthGate>,
    );
    expect(screen.queryByText("Authorized View")).toBeNull();
    expect(screen.getByText("Restricted")).toBeTruthy();
    expect(screen.getByText("users.manage")).toBeTruthy();
  });

  it("checks requiredRole against userRole", () => {
    const { rerender } = render(
      <AuthGate requiredRole="admin" userRole="viewer">
        <div>Admin Section</div>
      </AuthGate>,
    );
    expect(screen.queryByText("Admin Section")).toBeNull();
    expect(screen.getByText("admin")).toBeTruthy();

    rerender(
      <AuthGate requiredRole={["admin", "editor"]} userRole="editor">
        <div>Admin Section</div>
      </AuthGate>,
    );
    expect(screen.getByText("Admin Section")).toBeTruthy();
  });

  it("renders custom fallback when provided", () => {
    render(
      <AuthGate allowed={false} fallback={<div>Custom Access Denied</div>}>
        <div>Secret Content</div>
      </AuthGate>,
    );
    expect(screen.getByText("Custom Access Denied")).toBeTruthy();
    expect(screen.queryByText("Secret Content")).toBeNull();
  });
});
