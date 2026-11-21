import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthBrandPanel } from "./AuthBrandPanel";

describe("AuthBrandPanel", () => {
  it("renders brand name, title and description", () => {
    render(
      <AuthBrandPanel
        brandName="Polaris"
        brandMark="P"
        title="Operating desk"
        description="One workspace for teams"
      />
    );

    expect(screen.getByText("Polaris")).toBeTruthy();
    expect(screen.getByText("P")).toBeTruthy();
    expect(screen.getByText("Operating desk")).toBeTruthy();
    expect(screen.getByText("One workspace for teams")).toBeTruthy();
  });

  it("renders stats in a grid when provided as object array or tuple array", () => {
    render(
      <AuthBrandPanel
        title="With Stats"
        stats={[
          { label: "Active deals", value: 42 },
          ["100+", "Total users"],
        ]}
      />
    );

    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.getByText("Active deals")).toBeTruthy();
    expect(screen.getByText("100+")).toBeTruthy();
    expect(screen.getByText("Total users")).toBeTruthy();
  });

  it("renders notes when provided", () => {
    render(
      <AuthBrandPanel
        title="With Notes"
        notes={[
          { title: "Isolation", description: "Tenant scoped" },
          ["Locales", "Multi-language ready"],
        ]}
      />
    );

    expect(screen.getByText("Isolation")).toBeTruthy();
    expect(screen.getByText("Tenant scoped")).toBeTruthy();
    expect(screen.getByText("Locales")).toBeTruthy();
    expect(screen.getByText("Multi-language ready")).toBeTruthy();
  });

  it("renders footer and children", () => {
    render(
      <AuthBrandPanel
        title="Full layout"
        footer="Postgres secured"
      >
        <div data-testid="custom-child">Extra content</div>
      </AuthBrandPanel>
    );

    expect(screen.getByText("Postgres secured")).toBeTruthy();
    expect(screen.getByTestId("custom-child")).toBeTruthy();
  });
});
