/**
 * Auth Validation Error Keys
 *
 * Stable i18n keys for validation errors. The auth UI maps these to
 * localized messages via the consumer's translation system.
 *
 * Why keys instead of literal strings:
 *   - No hardcoded user-facing strings in source code
 *   - Centralized catalog: easier to audit and translate
 *   - Validators stay pure and testable
 */

export const AUTH_VALIDATION_KEYS = {
  emailRequired: 'auth.validation.emailRequired',
  emailInvalid: 'auth.validation.emailInvalid',
  passwordRequired: 'auth.validation.passwordRequired',
  passwordTooShort: 'auth.validation.passwordTooShort',
  passwordsDoNotMatch: 'auth.validation.passwordsDoNotMatch',
  nameRequired: 'auth.validation.nameRequired',
  invalidResetToken: 'auth.validation.invalidResetToken',
} as const;

export type AuthValidationKey = (typeof AUTH_VALIDATION_KEYS)[keyof typeof AUTH_VALIDATION_KEYS];
