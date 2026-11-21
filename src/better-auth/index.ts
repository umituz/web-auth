import { createAuthClient } from 'better-auth/client';
import type { AuthAdapter, SessionUser } from '../session/types';
import type { User } from '../types';

type AuthClient = ReturnType<typeof createAuthClient>;

function clientOf(baseURL?: string): AuthClient {
  if (baseURL && /^https?:\/\//i.test(baseURL)) {
    return createAuthClient({ baseURL });
  }
  return createAuthClient(baseURL ? { basePath: baseURL } : undefined);
}

interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
}

export interface BetterAuthAdapterOptions {
  role?: string;
  baseURL?: string;
}

function toSessionUser(user: BetterAuthUser, role: string): SessionUser {
  return { id: user.id, email: user.email, name: user.name, role };
}

export function betterAuthAdapter(options: BetterAuthAdapterOptions = {}): AuthAdapter {
  const role = options.role ?? 'member';
  const client = clientOf(options.baseURL);
  return {
    async login(credentials) {
      const { data, error } = await client.signIn.email(
        {
          email: credentials.email,
          password: credentials.password,
        },
        credentials.captchaToken
          ? { headers: { "x-captcha-response": credentials.captchaToken } }
          : undefined,
      );
      if (error) {
        throw new Error(
          error.code === 'INVALID_EMAIL_OR_PASSWORD' ? 'auth.errors.invalidCredentials' : 'auth.errors.loginFailed',
        );
      }
      return toSessionUser(data.user, role);
    },
    async logout() {
      await client.signOut();
    },
    async current() {
      try {
        const { data } = await client.getSession({ query: { disableCookieCache: true } });
        return data?.user ? toSessionUser(data.user, role) : null;
      } catch {
        return null;
      }
    },
  };
}

export async function betterAuthRegister(
  data: { email: string; password: string; name?: string; captchaToken?: string },
  baseURL?: string,
): Promise<User> {
  const client = clientOf(baseURL);
  const { data: result, error } = await client.signUp.email(
    {
      email: data.email,
      password: data.password,
      name: data.name?.trim() || data.email.split('@')[0] || '',
    },
    data.captchaToken
      ? { headers: { "x-captcha-response": data.captchaToken } }
      : undefined,
  );
  if (error) {
    throw new Error(
      error.code?.startsWith('USER_ALREADY_EXISTS') ? 'auth.validation.emailTaken' : 'auth.errors.registrationFailed',
    );
  }
  return { id: result.user.id, email: result.user.email, name: result.user.name };
}

export async function betterAuthForgotPassword(
  email: string,
  resetPath = '/reset-password',
  baseURL?: string,
  captchaToken?: string,
): Promise<void> {
  const client = clientOf(baseURL);
  const origin = typeof location !== 'undefined' ? location.origin : '';
  await client.requestPasswordReset(
    { email, redirectTo: `${origin}${resetPath}` },
    captchaToken ? { headers: { "x-captcha-response": captchaToken } } : undefined,
  );
}

export async function betterAuthResetPassword(data: { token: string; password: string }, baseURL?: string): Promise<void> {
  const client = clientOf(baseURL);
  const { error } = await client.resetPassword({ newPassword: data.password, token: data.token });
  if (error) {
    throw new Error('auth.validation.invalidResetToken');
  }
}

export async function betterAuthChangePassword(
  data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean },
  baseURL?: string,
): Promise<void> {
  const client = clientOf(baseURL);
  const { error } = await client.changePassword({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    revokeOtherSessions: data.revokeOtherSessions ?? true,
  });
  if (error) {
    throw new Error(
      error.code === 'INVALID_PASSWORD'
        ? 'auth.errors.invalidCurrentPassword'
        : 'auth.errors.changePasswordFailed',
    );
  }
}

export async function betterAuthRevokeOtherSessions(baseURL?: string): Promise<void> {
  const client = clientOf(baseURL);
  const { error } = await client.revokeOtherSessions();
  if (error) {
    throw new Error('auth.errors.revokeSessionsFailed');
  }
}

export async function betterAuthListSessions(baseURL?: string): Promise<Array<{
  id: string;
  token?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string | number;
  expiresAt?: string | number;
}>> {
  const client = clientOf(baseURL);
  const { data, error } = await client.listSessions();
  if (error || !data) return [];
  return Array.isArray(data) ? (data as never) : [];
}

export async function betterAuthRevokeSession(token: string, baseURL?: string): Promise<void> {
  const client = clientOf(baseURL);
  const { error } = await client.revokeSession({ token });
  if (error) {
    throw new Error('auth.errors.revokeSessionFailed');
  }
}

export async function betterAuthSendVerificationEmail(
  email: string,
  callbackURL?: string,
  baseURL?: string,
): Promise<void> {
  const client = clientOf(baseURL);
  const { error } = await client.sendVerificationEmail({
    email,
    callbackURL: callbackURL ?? (typeof location !== 'undefined' ? location.origin : undefined),
  });
  if (error) {
    throw new Error('auth.errors.sendVerificationFailed');
  }
}
