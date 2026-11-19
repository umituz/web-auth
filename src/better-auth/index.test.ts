import { describe, expect, it, vi, beforeEach } from 'vitest';

const signInEmail = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const signUpEmail = vi.fn();
const requestPasswordReset = vi.fn();
const resetPassword = vi.fn();
const changePassword = vi.fn();
const revokeOtherSessions = vi.fn();
const listSessions = vi.fn();
const revokeSession = vi.fn();
const sendVerificationEmail = vi.fn();

vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn(() => ({
    signIn: { email: signInEmail },
    signOut,
    getSession,
    signUp: { email: signUpEmail },
    requestPasswordReset,
    resetPassword,
    changePassword,
    revokeOtherSessions,
    listSessions,
    revokeSession,
    sendVerificationEmail,
  })),
}));

import { createAuthClient } from 'better-auth/client';
import {
  betterAuthAdapter,
  betterAuthRegister,
  betterAuthResetPassword,
  betterAuthChangePassword,
  betterAuthRevokeOtherSessions,
  betterAuthListSessions,
  betterAuthRevokeSession,
  betterAuthSendVerificationEmail,
} from './index';

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

describe('betterAuthChangePassword', () => {
  it('calls changePassword and resolves on success', async () => {
    changePassword.mockResolvedValue({ data: { status: true }, error: null });
    await expect(
      betterAuthChangePassword({ currentPassword: 'old', newPassword: 'new' }),
    ).resolves.toBeUndefined();
    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: 'old',
      newPassword: 'new',
      revokeOtherSessions: true,
    });
  });

  it('throws invalidCurrentPassword on INVALID_PASSWORD code', async () => {
    changePassword.mockResolvedValue({ data: null, error: { code: 'INVALID_PASSWORD', message: 'wrong' } });
    await expect(
      betterAuthChangePassword({ currentPassword: 'bad', newPassword: 'new' }),
    ).rejects.toThrow('auth.errors.invalidCurrentPassword');
  });
});

describe('betterAuthRevokeOtherSessions and sessions management', () => {
  it('calls revokeOtherSessions successfully', async () => {
    revokeOtherSessions.mockResolvedValue({ data: { status: true }, error: null });
    await expect(betterAuthRevokeOtherSessions()).resolves.toBeUndefined();
  });

  it('lists active sessions or returns empty array', async () => {
    listSessions.mockResolvedValue({ data: [{ id: 's1' }], error: null });
    const res = await betterAuthListSessions();
    expect(res).toEqual([{ id: 's1' }]);
  });

  it('calls revokeSession with token', async () => {
    revokeSession.mockResolvedValue({ data: { status: true }, error: null });
    await expect(betterAuthRevokeSession('token-123')).resolves.toBeUndefined();
    expect(revokeSession).toHaveBeenCalledWith({ token: 'token-123' });
  });

  it('calls sendVerificationEmail with email', async () => {
    sendVerificationEmail.mockResolvedValue({ data: { status: true }, error: null });
    await expect(betterAuthSendVerificationEmail('a@b.c')).resolves.toBeUndefined();
    expect(sendVerificationEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'a@b.c' }));
  });
});

describe('clientOf', () => {
  it('passes a relative base as basePath so environments without a location can build the client', () => {
    betterAuthAdapter({ baseURL: '/api/auth' });
    expect(createAuthClient).toHaveBeenCalledWith({ basePath: '/api/auth' });
  });

  it('passes an absolute base as baseURL', () => {
    betterAuthAdapter({ baseURL: 'https://example.com/api/auth' });
    expect(createAuthClient).toHaveBeenCalledWith({ baseURL: 'https://example.com/api/auth' });
  });

  it('omits options entirely when no base is given', () => {
    betterAuthAdapter();
    expect(createAuthClient).toHaveBeenCalledWith(undefined);
  });
});
