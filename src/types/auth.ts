
import type { ComponentType, ReactElement, ReactNode } from "react";
import type { DemoUser, MagicLinkResult, SessionUser, Tenant } from "../session/types";

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
  afterLoginRouteFor?: (user: User) => string;
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
  labels?: Record<string, string>;
  t?: Translate;
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

export interface DemoUserPick {
  userId: string;
  orgId?: string;
}

export interface LocaleOption {
  value: string;
  label: string;
}

export interface LocaleSwitcherConfig {
  locales: LocaleOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface AuthLayoutProps {
  config: AuthConfig;
  authState?: AuthState;
  authActions?: AuthActions;
  translate?: Translate;
  onSocialLogin?: (providerId: string) => void | Promise<void>;
  localeSwitcher?: LocaleSwitcherConfig;
  children?: React.ReactNode;
}

export interface AuthNavigateOptions {
  replace?: boolean;
}

export interface AuthStatusKeys {
  [status: number]: string;
}

export interface AuthFieldHints {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginFormProps {
  config: AuthConfig;
  defaultCredentials?: Partial<LoginCredentials>;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  showSocialLogin?: boolean;
  enableMockAuth?: boolean;
  autoFocusEmail?: boolean;
  statusKeys?: AuthStatusKeys;
  navigateOptions?: AuthNavigateOptions;
  onBusyChange?: (busy: boolean) => void;
  onLoginAttempt?: (credentials: LoginCredentials) => Promise<User>;
  onLoginSuccess?: (user: User) => void | Promise<void>;
  onLoginError?: (error: string) => void;
  onGoogleLogin?: () => void | Promise<void>;
  onAppleLogin?: () => void | Promise<void>;
}

export interface RegisterExtraFieldsRenderArgs {
  values: Record<string, string>;
  setValue: (name: string, value: string) => void;
  disabled: boolean;
}

export interface RegisterFormProps {
  config: AuthConfig;
  defaultData?: Partial<RegisterData>;
  showTerms?: boolean;
  showLoginLink?: boolean;
  requirePasswordConfirm?: boolean;
  requireName?: boolean;
  showSocialLogin?: boolean;
  extraFields?: (args: RegisterExtraFieldsRenderArgs) => ReactNode;
  initialValues?: Record<string, string>;
  fieldHints?: AuthFieldHints;
  autoFocusEmail?: boolean;
  statusKeys?: AuthStatusKeys;
  navigateOptions?: AuthNavigateOptions;
  onBusyChange?: (busy: boolean) => void;
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

export interface PasswordlessDemoAccount {
  id: string;
  email: string;
  label?: string;
  meta?: string;
}

export interface PasswordlessFormProps {
  config: AuthConfig;
  description?: string;
  demoAccounts?: PasswordlessDemoAccount[];
  defaultEmail?: string;
  onEmailChange?: (email: string) => void;
  disabled?: boolean;
  autoFocusEmail?: boolean;
  statusKeys?: AuthStatusKeys;
  onBusyChange?: (busy: boolean) => void;
  onPasswordlessLogin?: (email: string) => void | Promise<void>;
  onLoginError?: (error: string) => void;
  translate?: Translate;
}

export interface DemoUserPickerProps {
  users: DemoUser[];
  groups: DemoUserGroup[];
  onPick: (userId: string) => void | Promise<void>;
  searchable?: boolean;
  searchPlaceholder?: string;
  orgs?: Tenant[];
  onPickPair?: (pick: DemoUserPick) => void | Promise<void>;
}

export interface OrgPickerProps {
  config: AuthConfig;
  orgs: Tenant[];
  onPick: (orgId: string) => void | Promise<void>;
  title?: string;
  translate?: Translate;
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
