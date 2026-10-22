import { createAuthClient } from 'better-auth/client';
import type { AuthAdapter, SessionUser } from '../session/types';
import type { User } from '../types';

type AuthClient = ReturnType<typeof createAuthClient>;

function clientOf(baseURL?: string): AuthClient {
  return createAuthClient(baseURL ? { baseURL } : undefined);
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
      const { data, error } = await client.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });
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
  data: { email: string; password: string; name?: string },
  baseURL?: string,
): Promise<User> {
  const client = clientOf(baseURL);
  const { data: result, error } = await client.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name?.trim() || data.email.split('@')[0],
  });
  if (error) {
    throw new Error(
      error.code?.startsWith('USER_ALREADY_EXISTS') ? 'auth.validation.emailTaken' : 'auth.errors.registrationFailed',
    );
  }
  return { id: result.user.id, email: result.user.email, name: result.user.name };
}

export async function betterAuthForgotPassword(email: string, resetPath = '/reset-password', baseURL?: string): Promise<void> {
  const client = clientOf(baseURL);
  const origin = typeof location !== 'undefined' ? location.origin : '';
  await client.requestPasswordReset({ email, redirectTo: `${origin}${resetPath}` });
}

export async function betterAuthResetPassword(data: { token: string; password: string }, baseURL?: string): Promise<void> {
  const client = clientOf(baseURL);
  const { error } = await client.resetPassword({ newPassword: data.password, token: data.token });
  if (error) {
    throw new Error('auth.validation.invalidResetToken');
  }
}
