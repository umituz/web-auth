
import type { ComponentType, ReactElement, ReactNode } from "react";
import type { DemoUser, MagicLinkResult, SessionUser } from "../session/types";

export type Translate = (key: string, params?: Record<string, unknown>) => string;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  refresh: () => Promise<User | null>;
}

export interface AuthComponentProps {
  authState: AuthState;
  authActions: AuthActions;
  setAuthState: (state: Partial<AuthState>) => void;
}

export interface AuthStep {
  id: string;
  title: string;
  description?: string;
  component?: ComponentType<AuthComponentProps> | ReactElement;
  validate?: (data: Record<string, unknown>) => boolean;
}

export interface AuthConfig {
  brandName: string;
  brandTagline?: string;
  brandMedia?: ReactNode;
  loginRoute: string;
  registerRoute: string;
  forgotPasswordRoute?: string;
  termsRoute: string;
  privacyRoute: string;
  afterLoginRoute: string;
  afterLogoutRoute: string;
  showSocialLogin?: boolean;
  socialProviders?: SocialProvider[];
  homeRoute?: string;
  footerLinks?: Array<{ label: string; href: string }>;
  enableRememberMe?: boolean;
  requireEmailVerification?: boolean;
  steps?: AuthStep[];
  metadata?: Record<string, unknown>;
  roleHomeRoutes?: Record<string, string>;
  demoGroups?: DemoUserGroup[];
  magicLinkDemoNote?: string;
  magicLinkSentNote?: string;
}

export interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  color?: string;
  scopes?: string[];
}

export interface DemoUserGroup {
  id: string;
  title: string;
  roles: string[];
  roleLabels?: Record<string, string>;
}

export interface AuthLayoutProps {
  config: AuthConfig;
  authState?: AuthState;
  authActions?: AuthActions;
  translate?: Translate;
  onSocialLogin?: (providerId: string) => void | Promise<void>;
  children?: React.ReactNode;
}

export interface LoginFormProps {
  config: AuthConfig;
  defaultCredentials?: Partial<LoginCredentials>;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  showSocialLogin?: boolean;
  enableMockAuth?: boolean;
  onLoginAttempt?: (credentials: LoginCredentials) => Promise<User>;
  onLoginSuccess?: (user: User) => void | Promise<void>;
  onLoginError?: (error: string) => void;
  onGoogleLogin?: () => void | Promise<void>;
  onAppleLogin?: () => void | Promise<void>;
}

export interface RegisterFormProps {
  config: AuthConfig;
  defaultData?: Partial<RegisterData>;
  showTerms?: boolean;
  showLoginLink?: boolean;
  requirePasswordConfirm?: boolean;
  showSocialLogin?: boolean;
  onRegisterAttempt?: (data: RegisterData) => Promise<User>;
  onRegisterSuccess?: (user: User) => void | Promise<void>;
  onRegisterError?: (error: string) => void;
  onGoogleLogin?: () => void | Promise<void>;
  onAppleLogin?: () => void | Promise<void>;
}

export interface ForgotPasswordFormProps {
  config: AuthConfig;
  onSuccess?: (data: { email: string }) => void | Promise<void>;
  onError?: (error: string) => void;
  showBackLink?: boolean;
}

export interface ResetPasswordFormProps {
  config: AuthConfig;
  token: string;
  onSuccess?: (data: { token: string; password: string }) => void | Promise<void>;
  onError?: (error: string) => void;
}

export interface MagicLinkFormProps {
  config: AuthConfig;
  onRequestLink?: (email: string) => Promise<MagicLinkResult>;
  onLinkSent?: (result: MagicLinkResult) => void | Promise<void>;
  translate?: Translate;
  disabled?: boolean;
}

export interface DemoUserPickerProps {
  users: DemoUser[];
  groups: DemoUserGroup[];
  onPick: (userId: string) => void | Promise<void>;
}

export interface MagicLinkLoginPageProps {
  config: AuthConfig;
  title?: string;
  subtitle?: string;
  showDemoPicker?: boolean;
  onLogin?: (user: SessionUser) => void | Promise<void>;
  translate?: Translate;
}

export interface MagicLinkVerifyPageProps {
  config: AuthConfig;
  onVerified?: (user: SessionUser) => void | Promise<void>;
  translate?: Translate;
}
