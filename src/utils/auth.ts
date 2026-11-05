
import type { AuthConfig, DemoUserGroup, LoginCredentials, RegisterData, User } from "../types/auth";
import type { DemoUser } from "../session/types";
import { AUTH_VALIDATION_KEYS } from './validationKeys';

export { generateResetToken } from './secureToken';
export { AUTH_VALIDATION_KEYS } from './validationKeys';
export type { AuthValidationKey } from './validationKeys';

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

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

export function validateForgotPassword(data: { email: string }): ValidationResult {
  if (!data.email) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailRequired };
  }
  if (!isValidEmail(data.email)) {
    return { valid: false, error: AUTH_VALIDATION_KEYS.emailInvalid };
  }
  return { valid: true };
}

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

export function getUserDisplayName(user: User | null): string | null {
  if (!user) return null;
  return user.name || user.email || null;
}

export function getUserInitials(user: User | null): string | null {
  if (!user) return null;
  const name = user.name || user.email || "";
  if (!name) return null;
  const parts = name.trim().split(" ");
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last) {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified === true;
}

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

export function maskEmail(email: string): string | null {
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  const maskedLocal = local.charAt(0) + "***";
  return `${maskedLocal}@${domain}`;
}

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

export type PasswordStrengthBand = 'weak' | 'fair' | 'good' | 'strong';

export function getPasswordStrengthBand(password: string): PasswordStrengthBand {
  const score = calculatePasswordStrength(password);
  if (score < 25) return 'weak';
  if (score < 50) return 'fair';
  if (score < 75) return 'good';
  return 'strong';
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input.trim().slice(0, maxLength);
}

export function resolveHomeRoute(config: AuthConfig, role: string): string {
  return config.roleHomeRoutes?.[role] ?? config.afterLoginRoute;
}

export function groupDemoUsers(
  users: DemoUser[],
  groups: DemoUserGroup[],
): Array<DemoUserGroup & { users: DemoUser[] }> {
  return groups
    .map((group) => ({ ...group, users: users.filter((user) => group.roles.includes(user.role)) }))
    .filter((group) => group.users.length > 0);
}
