/**
 * Auth Utilities
 *
 * Validation and helper functions for authentication.
 * Validation messages are i18n keys, not hardcoded strings —
 * the consumer renders the localized text in its UI layer.
 */

import type { LoginCredentials, RegisterData, User } from "../types/auth";
import { AUTH_VALIDATION_KEYS } from './validationKeys';

export { generateResetToken } from './secureToken';
export { AUTH_VALIDATION_KEYS } from './validationKeys';
export type { AuthValidationKey } from './validationKeys';

/**
 * Validation result type — error is now an i18n key.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password length
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

/**
 * Validate login credentials
 */
export function validateLogin(credentials: LoginCredentials): ValidationResult {
  if (!credentials.email) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailRequired };
  }
  if (!isValidEmail(credentials.email)) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailInvalid };
  }
  if (!credentials.password) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordRequired };
  }
  return { valid: true };
}

/**
 * Validate registration data
 */
export function validateRegister(
  data: RegisterData & { confirmPassword?: string },
  requireName: boolean = false,
  requirePasswordConfirm?: boolean,
): ValidationResult {
  if (!data.email) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailRequired };
  }
  if (!isValidEmail(data.email)) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailInvalid };
  }
  if (requireName && !data.name) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.nameRequired };
  }
  if (!data.password) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordRequired };
  }
  if (!isValidPassword(data.password)) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordTooShort };
  }
  if (requirePasswordConfirm && data.password !== data.confirmPassword) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordsDoNotMatch };
  }
  return { valid: true };
}

/**
 * Validate forgot-password request
 */
export function validateForgotPassword(data: { email: string }): ValidationResult {
  if (!data.email) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailRequired };
  }
  if (!isValidEmail(data.email)) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailInvalid };
  }
  return { valid: true };
}

/**
 * Validate password reset confirmation
 */
export function validateResetPassword(data: {
  token: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  if (!data.token) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.invalidResetToken };
  }
  if (!data.password) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordRequired };
  }
  if (!isValidPassword(data.password)) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordTooShort };
  }
  if (data.password !== data.confirmPassword) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.passwordsDoNotMatch };
  }
  return { valid: true };
}

/**
 * Get user display name
 *
 * Returns null when no usable identifier exists, letting the caller
 * decide on a localized fallback. Avoids hardcoded "Guest"/"User" strings.
 */
export function getUserDisplayName(user: User | null): string | null {
  if (!user) return null;
  return user.name || user.email || null;
}

/**
 * Get user initials
 *
 * Returns null when no name is available, so the caller can decide
 * whether to render a placeholder or hide the avatar.
 */
export function getUserInitials(user: User | null): string | null {
  if (!user) return null;
  const name = user.name || user.email || "";
  if (!name) return null;
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Check if user has verified email
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified === true;
}

/**
 * Format user creation date
 *
 * Returns null when the user has no createdAt; the caller decides
 * whether to display "—" or hide the field.
 */
export function formatUserCreatedAt(
  user: User | null,
  locale: string = "en-US",
): string | null {
  if (!user?.createdAt) return null;
  return new Date(user.createdAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Mask email for privacy (e.g., u***@example.com)
 *
 * Returns null when the email is invalid so the caller can show
 * a "—" placeholder rather than the raw input.
 */
export function maskEmail(email: string): string | null {
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  const maskedLocal = local[0] + "***";
  return `${maskedLocal}@${domain}`;
}

/**
 * Password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;

  if (/[a-z]/.test(password)) score += 12.5;
  if (/[A-Z]/.test(password)) score += 12.5;
  if (/[0-9]/.test(password)) score += 12.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 12.5;

  return Math.min(score, 100);
}

/**
 * Password strength band. Numeric so the UI can map it to a label
 * via its own translation catalog.
 */
export type PasswordStrengthBand = 'weak' | 'fair' | 'good' | 'strong';

export function getPasswordStrengthBand(password: string): PasswordStrengthBand {
  const score = calculatePasswordStrength(password);
  if (score < 25) return 'weak';
  if (score < 50) return 'fair';
  if (score < 75) return 'good';
  return 'strong';
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input.trim().slice(0, maxLength);
}
