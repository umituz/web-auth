import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("renders an action button only when label and handler are both provided", () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <RestrictedNotice actionLabel="Back to dashboard" onAction={onAction} />,
    );
    fireEvent.click(screen.getByText("Back to dashboard"));
    expect(onAction).toHaveBeenCalledTimes(1);

    rerender(<RestrictedNotice actionLabel="Back to dashboard" />);
    expect(screen.queryByText("Back to dashboard")).toBeNull();

    rerender(<RestrictedNotice onAction={onAction} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
