/**
 * useAuth Hook
 *
 * Core authentication hook for managing auth state and actions.
 * Centralizes the try/catch+loading+error pattern via a single helper
 * to keep individual actions focused on their unique logic.
 */

import { useState, useCallback } from "react";
import type {
  AuthState,
  User,
  AuthActions,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../types/auth";
import {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
} from "../utils/auth";

/**
 * Auth provider contract — single source of truth for backend integration.
 */
export interface AuthProvider {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  refreshAuth: () => Promise<User | null>;
}

interface UseAuthOptions {
  /** Auth implementation (connects to your backend) */
  authProvider?: AuthProvider;
}

/**
 * Wrap a side-effectful async function with the standard
 * isLoading + error + throw contract.
 *
 * Important: the wrapped function is the SINGLE point of truth for
 * setting isLoading=false, ensuring errors are surfaced (not swallowed),
 * and re-throwing for callers that need to react.
 */
const executeAuthAction = async <T>(
  updateState: (updates: Partial<AuthState>) => void,
  fallbackErrorMessage: string,
  action: () => Promise<T>,
): Promise<T> => {
  updateState({ isLoading: true, error: null });
  try {
    return await action();
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message ? error.message : fallbackErrorMessage;
    updateState({ isLoading: false, error: errorMessage });
    throw error instanceof Error ? error : new Error(errorMessage);
  }
};

/**
 * useAuth hook
 *
 * Manages authentication state and provides auth actions.
 * Each action surfaces errors to the caller AND to the auth state.
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { authProvider } = options;

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  }, []);

  const requireProvider = useCallback((): AuthProvider => {
    if (!authProvider) {
      throw new Error("Auth provider not configured");
    }
    return authProvider;
  }, [authProvider]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      const validation = validateLogin(credentials);
      if (!validation.valid) {
        const message = validation.error ?? "Login validation failed";
        updateState({ error: message });
        throw new Error(message);
      }

      return executeAuthAction(updateState, "Login failed", async () => {
        const provider = requireProvider();
        const user = await provider.login(credentials);
        updateState({ isAuthenticated: true, user, isLoading: false, error: null });
        return user;
      });
    },
    [requireProvider, updateState],
  );

  const register = useCallback(
    async (data: RegisterData): Promise<User> => {
      const validation = validateRegister(data, false);
      if (!validation.valid) {
        const message = validation.error ?? "Registration validation failed";
        updateState({ error: message });
        throw new Error(message);
      }

      return executeAuthAction(updateState, "Registration failed", async () => {
        const provider = requireProvider();
        const user = await provider.register(data);
        updateState({ isAuthenticated: true, user, isLoading: false, error: null });
        return user;
      });
    },
    [requireProvider, updateState],
  );

  const logout = useCallback(async (): Promise<void> => {
    await executeAuthAction(updateState, "Logout failed", async () => {
      const provider = requireProvider();
      await provider.logout();
      updateState({ isAuthenticated: false, user: null, isLoading: false, error: null });
    });
  }, [requireProvider, updateState]);

  const forgotPassword = useCallback(
    async (data: ForgotPasswordData): Promise<void> => {
      const validation = validateForgotPassword(data);
      if (!validation.valid) {
        const message = validation.error ?? "Forgot password validation failed";
        updateState({ error: message });
        throw new Error(message);
      }

      await executeAuthAction(updateState, "Failed to send reset email", async () => {
        const provider = requireProvider();
        await provider.forgotPassword(data);
        updateState({ isLoading: false });
      });
    },
    [requireProvider, updateState],
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordData): Promise<void> => {
      const validation = validateResetPassword(data);
      if (!validation.valid) {
        const message = validation.error ?? "Reset password validation failed";
        updateState({ error: message });
        throw new Error(message);
      }

      await executeAuthAction(updateState, "Failed to reset password", async () => {
        const provider = requireProvider();
        await provider.resetPassword(data);
        updateState({ isLoading: false });
      });
    },
    [requireProvider, updateState],
  );

  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<User> => {
      const currentUser = authState.user;
      if (!currentUser) {
        const message = "No user to update";
        updateState({ error: message });
        throw new Error(message);
      }

      return executeAuthAction(updateState, "Failed to update profile", async () => {
        // Pure derivation of the new user, no side effects in setState callback.
        // Required fields come from the existing user; data overrides only the rest.
        const { id: _ignoredId, ...rest } = data;
        const updatedUser: User = {
          ...currentUser,
          ...rest,
          id: currentUser.id,
          email: data.email ?? currentUser.email,
        };
        updateState({ user: updatedUser, isLoading: false, error: null });
        return updatedUser;
      });
    },
    [authState.user, updateState],
  );

  const refresh = useCallback(async (): Promise<User | null> => {
    return executeAuthAction(updateState, "Failed to refresh authentication", async () => {
      const provider = requireProvider();
      const user = await provider.refreshAuth();
      updateState({ isAuthenticated: Boolean(user), user, isLoading: false, error: null });
      return user;
    });
  }, [requireProvider, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const authActions: AuthActions = {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    refresh,
  };

  return {
    ...authState,
    ...authActions,
    clearError,
  };
}
