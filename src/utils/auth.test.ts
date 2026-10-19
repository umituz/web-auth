/**
 * Tests for pure auth utility functions.
 */

import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  getUserDisplayName,
  getUserInitials,
  calculatePasswordStrength,
  getPasswordStrengthBand,
  maskEmail,
  sanitizeInput,
} from "./auth";
import { generateResetToken } from "./secureToken";
import { AUTH_VALIDATION_KEYS } from "./validationKeys";

describe("isValidEmail", () => {
  it("accepts plain addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects missing local part, domain, or TLD", () => {
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
    expect(isValidEmail("user example.com")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("enforces the minimum length", () => {
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("longenough")).toBe(true);
  });

  it("honors a custom minimum", () => {
    expect(isValidPassword("12345678", 12)).toBe(false);
    expect(isValidPassword("123456789012", 12)).toBe(true);
  });
});

describe("validateLogin", () => {
  it("passes valid credentials", () => {
    expect(validateLogin({ email: "a@b.co", password: "x".repeat(8) })).toEqual({ valid: true });
  });

  it("requires an email first", () => {
    expect(validateLogin({ email: "", password: "x" })).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.emailRequired,
    });
  });

  it("rejects a malformed email", () => {
    expect(validateLogin({ email: "nope", password: "x" })).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.emailInvalid,
    });
  });

  it("requires a password", () => {
    expect(validateLogin({ email: "a@b.co", password: "" })).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.passwordRequired,
    });
  });
});

describe("validateRegister", () => {
  const base = { email: "a@b.co", password: "longenough1" };

  it("passes with minimal data", () => {
    expect(validateRegister(base)).toEqual({ valid: true });
  });

  it("requires a name when asked to", () => {
    expect(validateRegister(base, true)).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.nameRequired,
    });
  });

  it("enforces password length", () => {
    expect(validateRegister({ ...base, password: "short" })).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.passwordTooShort,
    });
  });

  it("checks confirmation when required", () => {
    expect(
      validateRegister({ ...base, confirmPassword: "different" }, false, true),
    ).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.passwordsDoNotMatch,
    });
  });

  it("accepts matching confirmation when required (the RegisterForm call shape)", () => {
    expect(
      validateRegister({ ...base, name: "A", confirmPassword: base.password }, false, true),
    ).toEqual({ valid: true });
  });
});

describe("validateResetPassword", () => {
  const base = { token: "tok", password: "longenough", confirmPassword: "longenough" };

  it("passes matching valid data", () => {
    expect(validateResetPassword(base)).toEqual({ valid: true });
  });

  it("requires a token", () => {
    expect(validateResetPassword({ ...base, token: "" })).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.invalidResetToken,
    });
  });

  it("rejects mismatched confirmation", () => {
    expect(validateResetPassword({ ...base, confirmPassword: "other" })).toEqual({
      valid: false,
      error: AUTH_VALIDATION_KEYS.passwordsDoNotMatch,
    });
  });
});

describe("display helpers", () => {
  it("getUserDisplayName prefers name, then email, then null", () => {
    expect(getUserDisplayName({ id: "1", name: "Ada", email: "a@b.co" } as never)).toBe("Ada");
    expect(getUserDisplayName({ id: "1", email: "a@b.co" } as never)).toBe("a@b.co");
    expect(getUserDisplayName(null)).toBeNull();
  });

  it("getUserInitials uses first and last name parts", () => {
    expect(getUserInitials({ id: "1", name: "Ada Lovelace" } as never)).toBe("AL");
    expect(getUserInitials({ id: "1", name: "ada" } as never)).toBe("AD");
    expect(getUserInitials(null)).toBeNull();
  });
});

describe("password strength", () => {
  it("scores a strong password at 100", () => {
    expect(calculatePasswordStrength("Str0ng!Password")).toBe(100);
    expect(getPasswordStrengthBand("Str0ng!Password")).toBe("strong");
  });

  it("scores a weak password low", () => {
    expect(getPasswordStrengthBand("abc")).toBe("weak");
  });

  it("never exceeds 100", () => {
    expect(calculatePasswordStrength("aaaaaaaaaaaaaaaaaaaa!A1")).toBeLessThanOrEqual(100);
  });
});

describe("maskEmail", () => {
  it("masks the local part", () => {
    expect(maskEmail("umit@example.com")).toBe("u***@example.com");
  });

  it("returns null for invalid input", () => {
    expect(maskEmail("not-an-email")).toBeNull();
  });
});

describe("sanitizeInput", () => {
  it("trims and truncates", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
    expect(sanitizeInput("abcdef", 3)).toBe("abc");
  });
});

describe("generateResetToken", () => {
  it("produces a hex string of 2 * length chars", () => {
    const token = generateResetToken(16);
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it("produces different tokens on each call", () => {
    expect(generateResetToken()).not.toBe(generateResetToken());
  });
});
