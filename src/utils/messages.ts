import { defaultT, useT } from "@umituz/web-localization/react";
import type { Translate } from "../types/auth";

const MESSAGES: Record<string, string> = {
  'auth.login.welcomeBack': 'Welcome back',
  'auth.login.signInTo': 'Sign in to {{brand}}',
  'auth.login.submit': 'Sign in',
  'auth.login.submitting': 'Signing in…',
  'auth.login.rememberMe': 'Remember me',
  'auth.login.forgotPassword': 'Forgot password?',
  'auth.login.noAccount': "Don't have an account?",
  'auth.login.signUp': 'Sign up',
  'auth.login.orContinueWith': 'or continue with',

  'auth.register.createAccount': 'Create your account',
  'auth.register.join': 'Join {{brand}} to sync your progress across devices',
  'auth.register.fullName': 'Full name',
  'auth.register.confirmPassword': 'Confirm password',
  'auth.register.acceptTerms': 'I agree to the',
  'auth.register.termsOfService': 'Terms of Service',
  'auth.register.termsAnd': 'and',
  'auth.register.privacyPolicy': 'Privacy Policy',
  'auth.register.submit': 'Create account',
  'auth.register.submitting': 'Creating account…',
  'auth.register.haveAccount': 'Already have an account?',
  'auth.register.signIn': 'Sign in',
  'auth.register.mustAcceptTerms': 'You must accept the terms to continue',
  'auth.register.passwordsDoNotMatch': 'Passwords do not match',

  'auth.forgotPassword.title': 'Reset your password',
  'auth.forgotPassword.description': "Enter your account email and we'll send you a reset link.",
  'auth.forgotPassword.submit': 'Send reset link',
  'auth.forgotPassword.submitting': 'Sending…',
  'auth.forgotPassword.backToSignIn': 'Back to sign in',
  'auth.forgotPassword.successTitle': 'Check your inbox',
  'auth.forgotPassword.successMessage': 'If an account exists for that email, a reset link is on its way.',
  'auth.forgotPassword.sentTo': 'Reset link sent to',
  'auth.forgotPassword.checkEmail': 'Check your email for the reset link.',
  'auth.forgotPassword.steps.step1': 'Open the email we just sent you',
  'auth.forgotPassword.steps.step2': 'Click the secure reset link inside',
  'auth.forgotPassword.steps.step3': 'Choose a new password and sign back in',

  'auth.resetPassword.title': 'Choose a new password',
  'auth.resetPassword.description': 'Pick a strong password you have not used elsewhere.',
  'auth.resetPassword.newPassword': 'New password',
  'auth.resetPassword.confirmNewPassword': 'Confirm new password',
  'auth.resetPassword.submit': 'Update password',
  'auth.resetPassword.submitting': 'Updating…',
  'auth.resetPassword.successTitle': 'Password updated',
  'auth.resetPassword.successMessage': 'Your password has been changed. You can sign in with it now.',
  'auth.resetPassword.goToSignIn': 'Go to sign in',

  'auth.magicLink.submit': 'Send sign-in link',
  'auth.magicLink.submitting': 'Sending…',
  'auth.magicLink.openLink': 'Open sign-in link',
  'auth.magicLink.requestFailed': 'Could not send sign-in link',
  'auth.magicLink.demoNote': "Demo mode — the email isn't sent, use the link directly:",
  'auth.magicLink.sentNote': 'If this address has an account, a sign-in link is on its way.',
  'auth.magicLink.loginTitle': 'Sign in',
  'auth.magicLink.loginSubtitle': 'Pick a workspace member or request a sign-in link by email.',
  'auth.magicLink.divider': 'or sign in by email',
  'auth.magicLink.demoLoadFailed': 'Failed to load workspace members',
  'auth.magicLink.loginFailed': 'Sign-in failed',
  'auth.magicLink.verifyTitle': 'Signing you in',
  'auth.magicLink.verifySubtitle': 'Verifying your sign-in link…',
  'auth.magicLink.missingToken': 'Missing sign-in token',
  'auth.magicLink.verifyFailed': 'Sign-in failed',

  'auth.fields.email': 'Email',
  'auth.fields.password': 'Password',
  'auth.fields.name': 'Name',

  'auth.placeholders.emailExample': 'you@example.com',
  'auth.placeholders.password': '••••••••',
  'auth.placeholders.fullName': 'Ada Lovelace',
  'auth.placeholders.confirmPassword': '••••••••',

  'auth.errors.invalidCredentials': 'Incorrect email or password.',
  'auth.errors.loginFailed': 'Sign-in failed. Please try again.',
  'auth.errors.noAuthProvider': 'Authentication is not configured.',
  'auth.errors.registrationFailed': 'Account creation failed. Please try again.',
  'auth.errors.emailRequired': 'Email is required.',
  'auth.errors.emailInvalid': 'Enter a valid email address.',
  'auth.errors.passwordRequired': 'Password is required.',
  'auth.errors.passwordTooShort': 'Password must be at least 8 characters.',
  'auth.errors.passwordsDoNotMatch': 'Passwords do not match.',
  'auth.errors.sendResetFailed': 'Could not send the reset email. Please try again.',
  'auth.errors.resetFailed': 'Could not reset the password. Please try again.',

  'auth.passwordStrength.weak': 'Weak',
  'auth.passwordStrength.fair': 'Fair',
  'auth.passwordStrength.good': 'Good',
  'auth.passwordStrength.strong': 'Strong',

  'auth.social.continueWithGoogle': 'Continue with Google',
  'auth.social.continueWithApple': 'Continue with Apple',

  'auth.layout.backToHome': 'Back to home',
  'auth.layout.orContinueWith': 'or continue with',
  'auth.layout.allRightsReserved': 'All rights reserved.',

  'auth.a11y.showPassword': 'Show password',
  'auth.a11y.hidePassword': 'Hide password',

  'auth.validation.emailRequired': 'Email is required.',
  'auth.validation.emailInvalid': 'Enter a valid email address.',
  'auth.validation.passwordRequired': 'Password is required.',
  'auth.validation.passwordTooShort': 'Password must be at least 8 characters.',
  'auth.validation.passwordsDoNotMatch': 'Passwords do not match.',
  'auth.validation.nameRequired': 'Name is required.',
  'auth.validation.emailTaken': 'An account with this email already exists.',
  'auth.validation.invalidResetToken': 'This reset link is invalid or has expired.',
};

const interpolate = (text: string, params?: Record<string, unknown>): string => {
  if (!params) return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
};

export const authT: Translate = (key, params) => {
  const message = MESSAGES[key];
  if (message) return interpolate(message, params);
  return defaultT(key, params);
};

export const createAuthT = (overrides: Record<string, string>): Translate => {
  return (key, params) => {
    const override = overrides[key];
    if (override !== undefined) return interpolate(override, params);
    return authT(key, params);
  };
};

export const useAuthT = (): Translate => {
  const provided = useT();
  return provided === defaultT ? authT : provided;
};
