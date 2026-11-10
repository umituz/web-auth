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
