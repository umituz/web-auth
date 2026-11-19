import { describe, expect, it } from 'vitest';
import { evaluatePasswordRules, validateChangePassword } from './passwordRules';

describe('evaluatePasswordRules', () => {
  it('identifies failing rules for empty password', () => {
    const res = evaluatePasswordRules('');
    expect(res.isValid).toBe(false);
    expect(res.score).toBe(0);
    expect(res.strength).toBe('weak');
    expect(res.rules.every((r) => !r.passed)).toBe(true);
  });

  it('validates a strong password meeting all criteria', () => {
    const res = evaluatePasswordRules('P@ssw0rd2026!');
    expect(res.isValid).toBe(true);
    expect(res.score).toBe(5);
    expect(res.strength).toBe('strong');
    expect(res.rules.find((r) => r.id === 'minLength')?.passed).toBe(true);
    expect(res.rules.find((r) => r.id === 'hasSpecial')?.passed).toBe(true);
  });

  it('fails validation when lowercase is missing if requireLower is true', () => {
    const res = evaluatePasswordRules('PASSWORD123!', { requireLower: true });
    expect(res.isValid).toBe(false);
    expect(res.rules.find((r) => r.id === 'hasLower')?.passed).toBe(false);
  });

  it('allows custom minLength', () => {
    const res = evaluatePasswordRules('Abc1!', { minLength: 10 });
    expect(res.isValid).toBe(false);
    expect(res.rules.find((r) => r.id === 'minLength')?.passed).toBe(false);
  });
});

describe('validateChangePassword', () => {
  it('requires current password when requireCurrent is true', () => {
    const res = validateChangePassword({
      currentPassword: '',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe('auth.validation.currentPasswordRequired');
    }
  });

  it('validates matching confirmPassword', () => {
    const res = validateChangePassword({
      currentPassword: 'OldPassword1!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'MismatchPassword1!',
    });
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe('auth.validation.passwordsDoNotMatch');
    }
  });

  it('rejects new password if identical to current password', () => {
    const res = validateChangePassword({
      currentPassword: 'SamePassword123!',
      newPassword: 'SamePassword123!',
      confirmPassword: 'SamePassword123!',
    });
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe('auth.validation.passwordSameAsCurrent');
    }
  });

  it('accepts valid password change', () => {
    const res = validateChangePassword({
      currentPassword: 'OldPassword1!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });
    expect(res.valid).toBe(true);
  });
});
