/**
 * Auth Types
 *
 * Type definitions for authentication system
 */

import type { ComponentType, ReactElement } from "react";

/**
 * Translation function contract. Auth components stay i18n-agnostic;
 * the consumer plugs in their i18n library of choice.
 * Interpolation params follow the i18next convention (`{{placeholder}}`).
 */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * User credentials for login
 */
export interface LoginCredentials {
  /** Email address */
  email: string;
  /** Password */
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** Full name */
  name?: string;
  /** Additional user data */
  metadata?: Record<string, unknown>;
}

/**
 * Password reset request
 */
export interface ForgotPasswordData {
  /** Email address */
  email: string;
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordData {
  /** Reset token from email */
  token: string;
  /** New password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Auth state
 */
export interface AuthState {
  /** Is user authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: User | null;
  /** Is authentication loading */
  isLoading: boolean;
  /** Authentication error */
  error: string | null;
}

/**
 * User profile
 */
export interface User {
  /** Unique user ID */
  id: string;
  /** Email address */
  email: string;
  /** Display name */
  name?: string;
  /** Profile avatar URL */
  avatar?: string;
  /** Email verification status */
  emailVerified?: boolean;
  /** Additional user data */
  metadata?: Record<string, unknown>;
  /** Account creation date */
  createdAt?: string;
  /** Last login date */
  lastLoginAt?: string;
}

/**
 * Auth actions
 */
export interface AuthActions {
  /** Login with email/password */
  login: (credentials: LoginCredentials) => Promise<User>;
  /** Register new account */
  register: (data: RegisterData) => Promise<User>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Send password reset email */
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  /** Reset password with token */
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  /** Update user profile */
  updateProfile: (data: Partial<User>) => Promise<User>;
  /** Refresh authentication session */
  refresh: () => Promise<User | null>;
}

/**
 * Auth component props
 */
export interface AuthComponentProps {
  /** Current auth state */
  authState: AuthState;
  /** Auth actions */
  authActions: AuthActions;
  /** Update auth state */
  setAuthState: (state: Partial<AuthState>) => void;
}

/**
 * Auth step configuration
 */
export interface AuthStep {
  /** Step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Custom component */
  component?: ComponentType<AuthComponentProps> | ReactElement;
  /** Validation function */
  validate?: (data: Record<string, unknown>) => boolean;
}

/**
 * Auth configuration
 */
export interface AuthConfig {
  /** Brand/application name */
  brandName: string;
  /** Brand tagline */
  brandTagline?: string;
  /** Login route */
  loginRoute: string;
  /** Register route */
  registerRoute: string;
  /** Forgot password route */
  forgotPasswordRoute?: string;
  /** Route after successful login */
  afterLoginRoute: string;
  /** Route after logout */
  afterLogoutRoute: string;
  /** Show social login options */
  showSocialLogin?: boolean;
  /** Available social providers */
  socialProviders?: SocialProvider[];
  /** Public home route (header "back" link). Falls back to `afterLoginRoute`. */
  homeRoute?: string;
  /** Footer links (rendered only when provided — no defaults that 404) */
  footerLinks?: Array<{ label: string; href: string }>;
  /** Enable remember me */
  enableRememberMe?: boolean;
  /** Enable email verification */
  requireEmailVerification?: boolean;
  /** Auth steps (for multi-step onboarding) */
  steps?: AuthStep[];
  /** Additional configuration */
  metadata?: Record<string, unknown>;
}

/**
 * Social login provider
 */
export interface SocialProvider {
  /** Provider ID */
  id: string;
  /** Display name */
  name: string;
  /** Icon/emoji */
  icon: string;
  /** Color theme */
  color?: string;
  /** Scopes to request */
  scopes?: string[];
}

/**
 * Auth layout props
 */
export interface AuthLayoutProps {
  /** Auth configuration */
  config: AuthConfig;
  /** Current auth state */
  authState?: AuthState;
  /** Auth actions */
  authActions?: AuthActions;
  /** Optional translation function for layout strings (falls back to embedded English) */
  translate?: Translate;
  /** Social provider login handler (receives the provider id) */
  onSocialLogin?: (providerId: string) => void | Promise<void>;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * Login form props
 */
export interface LoginFormProps {
  /** Auth configuration */
  config: AuthConfig;
  /** Initial credentials */
  defaultCredentials?: Partial<LoginCredentials>;
  /** Show remember me checkbox */
  showRememberMe?: boolean;
  /** Show forgot password link */
  showForgotPassword?: boolean;
  /** Show register link */
  showRegisterLink?: boolean;
  /** Show social login buttons */
  showSocialLogin?: boolean;
  /**
   * Allow the built-in mock login (accepts ANY credentials) for demos.
   * Defaults to false — without `onLoginAttempt` the form reports a
   * configuration error instead of silently "logging in".
   */
  enableMockAuth?: boolean;
  /** Custom login handler (receives credentials, returns user) */
  onLoginAttempt?: (credentials: LoginCredentials) => Promise<User>;
  /** On successful login (called after onLoginAttempt or mock auth succeeds) */
  onLoginSuccess?: (user: User) => void | Promise<void>;
  /** On login error */
  onLoginError?: (error: string) => void;
  /** Google login handler */
  onGoogleLogin?: () => void | Promise<void>;
  /** Apple login handler */
  onAppleLogin?: () => void | Promise<void>;
}

/**
 * Register form props
 */
export interface RegisterFormProps {
  /** Auth configuration */
  config: AuthConfig;
  /** Initial registration data */
  defaultData?: Partial<RegisterData>;
  /** Show terms checkbox */
  showTerms?: boolean;
  /** Show login link */
  showLoginLink?: boolean;
  /** Require password confirmation */
  requirePasswordConfirm?: boolean;
  /** Show social login buttons */
  showSocialLogin?: boolean;
  /** Custom register handler (receives register data, returns user) - overrides mock auth */
  onRegisterAttempt?: (data: RegisterData) => Promise<User>;
  /** On successful registration (called after onRegisterAttempt or mock auth succeeds) */
  onRegisterSuccess?: (user: User) => void | Promise<void>;
  /** On registration error */
  onRegisterError?: (error: string) => void;
  /** Google login handler */
  onGoogleLogin?: () => void | Promise<void>;
  /** Apple login handler */
  onAppleLogin?: () => void | Promise<void>;
}

/**
 * Forgot password form props
 */
export interface ForgotPasswordFormProps {
  /** Auth configuration */
  config: AuthConfig;
  /** Submit handler — receives the entered email and performs the reset request */
  onSuccess?: (data: { email: string }) => void | Promise<void>;
  /** On error */
  onError?: (error: string) => void;
  /** Show back to login link */
  showBackLink?: boolean;
}

/**
 * Reset password form props
 */
export interface ResetPasswordFormProps {
  /** Auth configuration */
  config: AuthConfig;
  /** Reset token */
  token: string;
  /** Submit handler — receives the token and the new password */
  onSuccess?: (data: { token: string; password: string }) => void | Promise<void>;
  /** On error */
  onError?: (error: string) => void;
}
