export {
  isValidEmail,
  isValidPassword,
  validateLogin,
  validateRegister,
  validateForgotPassword,
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
  type ValidationResult,
  type PasswordStrengthBand,
} from "./auth";

export { authErrorMessage } from "./errors";
export { AUTH_KEYS } from "./i18nKeys";
export { AUTH_VALIDATION_KEYS } from "./validationKeys";
export type { AuthValidationKey } from "./validationKeys";
