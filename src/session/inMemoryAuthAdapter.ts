/**
 * In-memory auth adapter — zero-dependency default for demos,
 * Storybook-style setups and tests. Credentials are NOT checked
 * (any password logs in); demo accounts log in by user id.
 */

import type {
  AuthAdapter,
  LoginCredentials,
  SessionUser,
} from "./types";

export interface InMemoryAuthAdapterOptions {
  /** Users available for login/demo. */
  users: readonly SessionUser[];
}

export const createInMemoryAuthAdapter = ({
  users,
}: InMemoryAuthAdapterOptions): AuthAdapter => {
  let currentUser: SessionUser | null = null;

  const findByEmail = (email: string): SessionUser | undefined =>
    users.find((user) => user.email === email);

  return {
    async login({ email }: LoginCredentials): Promise<SessionUser> {
      const user = findByEmail(email);
      if (!user) {
        throw new Error(`No user with email ${email}`);
      }
      currentUser = user;
      return user;
    },

    async logout(): Promise<void> {
      currentUser = null;
    },

    async current(): Promise<SessionUser | null> {
      return currentUser;
    },

    async demoLogin(userId: string): Promise<SessionUser> {
      const user = users.find((candidate) => candidate.id === userId);
      if (!user) {
        throw new Error(`No demo user with id ${userId}`);
      }
      currentUser = user;
      return user;
    },
  };
};
