import type { ValidationResult } from "./auth";

export type PasswordRuleId = 'minLength' | 'hasLower' | 'hasUpper' | 'hasNumber' | 'hasSpecial';

export interface PasswordRule {
  id: PasswordRuleId;
  labelKey: string;
  defaultLabel: string;
  passed: boolean;
}

export interface PasswordEvaluation {
  isValid: boolean;
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  rules: PasswordRule[];
}

export interface PasswordRulesOptions {
  minLength?: number;
  requireLower?: boolean;
  requireUpper?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

export function evaluatePasswordRules(
  password: string,
  options: PasswordRulesOptions = {},
): PasswordEvaluation {
  const minLength = options.minLength ?? 8;
  const requireLower = options.requireLower ?? true;
  const requireUpper = options.requireUpper ?? true;
  const requireNumber = options.requireNumber ?? true;
  const requireSpecial = options.requireSpecial ?? false;

  const rules: PasswordRule[] = [
    {
      id: 'minLength',
      labelKey: 'auth.passwordRules.minLength',
      defaultLabel: `At least ${minLength} characters`,
      passed: password.length >= minLength,
    },
    {
      id: 'hasLower',
      labelKey: 'auth.passwordRules.hasLower',
      defaultLabel: 'At least one lowercase letter',
      passed: /[a-z]/.test(password),
    },
    {
      id: 'hasUpper',
      labelKey: 'auth.passwordRules.hasUpper',
      defaultLabel: 'At least one uppercase letter',
      passed: /[A-Z]/.test(password),
    },
    {
      id: 'hasNumber',
      labelKey: 'auth.passwordRules.hasNumber',
      defaultLabel: 'At least one number',
      passed: /[0-9]/.test(password),
    },
    {
      id: 'hasSpecial',
      labelKey: 'auth.passwordRules.hasSpecial',
      defaultLabel: 'At least one special character',
      passed: /[^a-zA-Z0-9]/.test(password),
    },
  ];

  const requiredRules = rules.filter((rule) => {
    if (rule.id === 'minLength') return true;
    if (rule.id === 'hasLower') return requireLower;
    if (rule.id === 'hasUpper') return requireUpper;
    if (rule.id === 'hasNumber') return requireNumber;
    if (rule.id === 'hasSpecial') return requireSpecial;
    return false;
  });

  const passedRequired = requiredRules.every((r) => r.passed);
  const totalPassed = rules.filter((r) => r.passed).length;

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (totalPassed >= 5 && password.length >= 10) {
    strength = 'strong';
  } else if (totalPassed >= 4 && password.length >= 8) {
    strength = 'good';
  } else if (totalPassed >= 2) {
    strength = 'fair';
  }

  return {
    isValid: passedRequired,
    score: totalPassed,
    strength,
    rules,
  };
}

export interface ValidateChangePasswordInput {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  requireCurrent?: boolean;
  minLength?: number;
}

export function validateChangePassword(input: ValidateChangePasswordInput): ValidationResult {
  const requireCurrent = input.requireCurrent ?? true;
  const minLength = input.minLength ?? 8;

  if (requireCurrent && (!input.currentPassword || !input.currentPassword.trim())) {
    return { valid: false, error: 'auth.validation.currentPasswordRequired' };
  }

  if (!input.newPassword || input.newPassword.length < minLength) {
    return { valid: false, error: 'auth.validation.passwordTooShort' };
  }

  if (input.confirmPassword !== undefined && input.newPassword !== input.confirmPassword) {
    return { valid: false, error: 'auth.validation.passwordsDoNotMatch' };
  }

  if (requireCurrent && input.currentPassword === input.newPassword) {
    return { valid: false, error: 'auth.validation.passwordSameAsCurrent' };
  }

  return { valid: true };
}
