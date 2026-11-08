import { describe, it, expect } from "vitest";
import { authT, createAuthT } from "./messages";
import { AUTH_KEYS } from "./i18nKeys";
import { AUTH_VALIDATION_KEYS } from "./validationKeys";

describe("authT", () => {
  it("resolves catalog entries", () => {
    expect(authT(AUTH_KEYS.login.welcomeBack)).toBe("Welcome back");
    expect(authT(AUTH_VALIDATION_KEYS.emailTaken)).toBe("An account with this email already exists.");
  });

  it("interpolates params", () => {
    expect(authT(AUTH_KEYS.login.signInTo, { brand: "Codora" })).toBe("Sign in to Codora");
  });

  it("falls back to the humanized key tail outside the catalog", () => {
    expect(authT("auth.custom.unknownKey")).toBe("Unknown key");
  });
});

describe("createAuthT", () => {
  it("lets overrides win over the catalog", () => {
    const t = createAuthT({ [AUTH_KEYS.login.welcomeBack]: "Hoş geldin" });
    expect(t(AUTH_KEYS.login.welcomeBack)).toBe("Hoş geldin");
    expect(t(AUTH_KEYS.login.submit)).toBe("Sign in");
  });
});
