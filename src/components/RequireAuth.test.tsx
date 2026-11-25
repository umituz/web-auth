import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { RequireAuth } from "./RequireAuth";

describe("RequireAuth", () => {
  it("renders fallback when loading is true", () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            path="/app"
            element={
              <RequireAuth loading={true} fallback={<p>Authenticating…</p>}>
                <p>Protected Content</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Authenticating…")).toBeTruthy();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("renders protected content when isAuthenticated is true", () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            path="/app"
            element={
              <RequireAuth isAuthenticated={true}>
                <p>Protected Content</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("redirects when isAuthenticated is false", () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            path="/app"
            element={
              <RequireAuth isAuthenticated={false} loginRoute="/login">
                <p>Protected Content</p>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<p>Login Route</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Login Route")).toBeTruthy();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });
});
