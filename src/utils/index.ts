export {
  isValidEmail,
  isValidPassword,
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validatePasswordless,
  validateResetPassword,
  getUserDisplayName,
  getUserInitials,
  isEmailVerified,
  formatUserCreatedAt,
  maskEmail,
  generateResetToken,
  calculatePasswordStrength,
  getPasswordStrengthBand,
  sanitizeInput,
  resolveHomeRoute,
  groupDemoUsers,
  type ValidationResult,
  type PasswordStrengthBand,
} from "./auth";

export { authErrorMessage } from "./errors";
export { AUTH_KEYS } from "./i18nKeys";
export { authT, createAuthT, useAuthT, AuthI18nProvider, AuthI18nContext, defaultT } from "./messages";
export { AUTH_VALIDATION_KEYS } from "./validationKeys";
export type { AuthValidationKey } from "./validationKeys";
export {
  evaluatePasswordRules,
  validateChangePassword,
  type PasswordRule,
  type PasswordEvaluation,
  type PasswordRulesOptions,
  type ValidateChangePasswordInput,
} from "./passwordRules";

export {
  createRateLimiter,
  createBruteForceGuard,
  type RateLimitOptions,
  type RateLimitResult,
  type RateLimiter,
  type BruteForceOptions,
  type BruteForceResult,
  type BruteForceGuard,
} from "./rateLimit";

export {
  detectSuspiciousLogin,
  sanitizeSensitiveData,
  validateAgeEligibility,
  buildUserDataExport,
  type SuspiciousRiskLevel,
  type SessionFootprint,
  type SuspiciousLoginAnalysis,
  type AgeEligibilityResult,
  type UserDataExport,
} from "./securityAudit";

export {
  getStoredCookiePreferences,
  saveCookiePreferences,
  hasUserGivenCookieConsent,
  COOKIE_CONSENT_STORAGE_KEY,
  DEFAULT_COOKIE_PREFERENCES,
  type CookiePreferences,
} from "./cookieConsent";
