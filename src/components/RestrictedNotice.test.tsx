import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RestrictedNotice } from "./RestrictedNotice";

describe("RestrictedNotice", () => {
  it("renders default title, icon and description", () => {
    render(<RestrictedNotice />);
    expect(screen.getByText("Restricted")).toBeTruthy();
    expect(screen.getByText("⌀")).toBeTruthy();
    expect(screen.getByText("You do not have permission to access this resource.")).toBeTruthy();
  });

  it("renders permission specific description", () => {
    render(<RestrictedNotice permission="artworks.delete" />);
    expect(screen.getByText("artworks.delete")).toBeTruthy();
    expect(screen.getByText(/Your role does not include/)).toBeTruthy();
  });

  it("renders requiredRole specific description", () => {
    render(<RestrictedNotice requiredRole="admin" />);
    expect(screen.getByText("admin")).toBeTruthy();
    expect(screen.getByText(/This section requires the/)).toBeTruthy();
  });
});
