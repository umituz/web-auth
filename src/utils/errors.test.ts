import { describe, it, expect } from "vitest";
import { authErrorMessage } from "./errors";

describe("authErrorMessage", () => {
  it("maps a listed status to its key", () => {
    const err = Object.assign(new Error("Invalid credentials"), { status: 401 });
    expect(authErrorMessage(err, "auth.errors.loginFailed", { 401: "auth.errors.invalidCredentials" })).toBe(
      "auth.errors.invalidCredentials",
    );
  });

  it("falls back to the generic key for unlisted statuses", () => {
    const err = Object.assign(new Error("Backend worker offline"), { status: 503 });
    expect(authErrorMessage(err, "auth.errors.loginFailed", { 401: "auth.errors.invalidCredentials" })).toBe(
      "auth.errors.loginFailed",
    );
  });

  it("keeps local error messages without a status", () => {
    expect(authErrorMessage(new Error("auth.errors.noAuthProvider"), "auth.errors.loginFailed")).toBe(
      "auth.errors.noAuthProvider",
    );
  });

  it("uses the fallback key for non-error throws", () => {
    expect(authErrorMessage("nope", "auth.errors.loginFailed")).toBe("auth.errors.loginFailed");
    expect(authErrorMessage(null, "auth.errors.loginFailed")).toBe("auth.errors.loginFailed");
  });
});
