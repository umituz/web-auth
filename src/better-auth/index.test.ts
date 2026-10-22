import { describe, expect, it, vi, beforeEach } from 'vitest';

const signInEmail = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const signUpEmail = vi.fn();
const requestPasswordReset = vi.fn();
const resetPassword = vi.fn();

vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn(() => ({
    signIn: { email: signInEmail },
    signOut,
    getSession,
    signUp: { email: signUpEmail },
    requestPasswordReset,
    resetPassword,
  })),
}));

import { betterAuthAdapter, betterAuthRegister, betterAuthResetPassword } from './index';

const user = { id: 'u1', email: 'a@b.c', name: 'A B' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('betterAuthAdapter.login', () => {
  it('maps a signed-in user to SessionUser with the configured role', async () => {
    signInEmail.mockResolvedValue({ data: { user, token: 't' }, error: null });
    const sessionUser = await betterAuthAdapter({ role: 'learner' }).login({ email: 'a@b.c', password: 'pw' });
    expect(sessionUser).toEqual({ id: 'u1', email: 'a@b.c', name: 'A B', role: 'learner' });
  });

  it('throws the invalidCredentials key for INVALID_EMAIL_OR_PASSWORD', async () => {
    signInEmail.mockResolvedValue({ data: null, error: { code: 'INVALID_EMAIL_OR_PASSWORD', message: 'no' } });
    await expect(betterAuthAdapter().login({ email: 'a@b.c', password: 'pw' })).rejects.toThrow(
      'auth.errors.invalidCredentials',
    );
  });

  it('throws the loginFailed key for other errors', async () => {
    signInEmail.mockResolvedValue({ data: null, error: { code: 'INTERNAL_SERVER_ERROR', message: 'boom' } });
    await expect(betterAuthAdapter().login({ email: 'a@b.c', password: 'pw' })).rejects.toThrow('auth.errors.loginFailed');
  });
});

describe('betterAuthAdapter.current', () => {
  it('maps an active session user', async () => {
    getSession.mockResolvedValue({ data: { user, session: { id: 's1' } }, error: null });
    expect(await betterAuthAdapter({ role: 'admin' }).current()).toEqual({ id: 'u1', email: 'a@b.c', name: 'A B', role: 'admin' });
  });

  it('returns null without a session', async () => {
    getSession.mockResolvedValue({ data: null, error: null });
    expect(await betterAuthAdapter().current()).toBeNull();
  });

  it('returns null when the request throws (backend offline)', async () => {
    getSession.mockRejectedValue(new Error('offline'));
    expect(await betterAuthAdapter().current()).toBeNull();
  });
});

describe('betterAuthAdapter.logout', () => {
  it('signs out through the client', async () => {
    signOut.mockResolvedValue({ data: { success: true }, error: null });
    await betterAuthAdapter().logout();
    expect(signOut).toHaveBeenCalledOnce();
  });
});

describe('betterAuthRegister', () => {
  it('falls back to the email local-part when the name is empty', async () => {
    signUpEmail.mockResolvedValue({ data: { user, token: 't' }, error: null });
    const registered = await betterAuthRegister({ email: 'jane@x.y', password: 'pw', name: '  ' });
    expect(registered).toEqual({ id: 'u1', email: 'a@b.c', name: 'A B' });
    expect(signUpEmail).toHaveBeenCalledWith(expect.objectContaining({ name: 'jane' }));
  });

  it('throws the emailTaken key for duplicate sign-up', async () => {
    signUpEmail.mockResolvedValue({ data: null, error: { code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', message: 'dup' } });
    await expect(betterAuthRegister({ email: 'a@b.c', password: 'pw' })).rejects.toThrow('auth.validation.emailTaken');
  });

  it('throws the registrationFailed key for other errors', async () => {
    signUpEmail.mockResolvedValue({ data: null, error: { code: 'WEAK_PASSWORD', message: 'weak' } });
    await expect(betterAuthRegister({ email: 'a@b.c', password: 'pw' })).rejects.toThrow('auth.errors.registrationFailed');
  });
});

describe('betterAuthResetPassword', () => {
  it('throws the invalidResetToken key on error', async () => {
    resetPassword.mockResolvedValue({ data: null, error: { code: 'INVALID_TOKEN', message: 'bad' } });
    await expect(betterAuthResetPassword({ token: 't', password: 'pw' })).rejects.toThrow('auth.validation.invalidResetToken');
  });

  it('resolves silently on success', async () => {
    resetPassword.mockResolvedValue({ data: { status: true }, error: null });
    await expect(betterAuthResetPassword({ token: 't', password: 'pw' })).resolves.toBeUndefined();
  });
});
