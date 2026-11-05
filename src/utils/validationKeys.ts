
export const AUTH_VALIDATION_KEYS = {
  emailRequired: 'auth.validation.emailRequired',
  emailInvalid: 'auth.validation.emailInvalid',
  passwordRequired: 'auth.validation.passwordRequired',
  passwordTooShort: 'auth.validation.passwordTooShort',
  passwordsDoNotMatch: 'auth.validation.passwordsDoNotMatch',
  nameRequired: 'auth.validation.nameRequired',
  emailTaken: 'auth.validation.emailTaken',
  invalidResetToken: 'auth.validation.invalidResetToken',
} as const;

export type AuthValidationKey = (typeof AUTH_VALIDATION_KEYS)[keyof typeof AUTH_VALIDATION_KEYS];
