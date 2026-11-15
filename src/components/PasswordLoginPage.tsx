import { useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useAuthT } from "../utils/messages";
import type {
  AuthConfig,
  LocaleSwitcherConfig,
  LoginFormProps,
  RegisterFormProps,
  Translate,
} from "../types/auth";

const LINK_BUTTON_STYLE = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: 14,
} as const;

export interface PasswordLoginPageProps extends Omit<LoginFormProps, "config"> {
  config: AuthConfig;
  allowRegister?: boolean;
  initialMode?: "login" | "register";
  registerProps?: Partial<Omit<RegisterFormProps, "config">>;
  onRegisterAttempt?: RegisterFormProps["onRegisterAttempt"];
  onRegisterSuccess?: RegisterFormProps["onRegisterSuccess"];
  isAuthenticated?: boolean;
  redirectTo?: string;
  translate?: Translate;
  localeSwitcher?: LocaleSwitcherConfig;
  children?: ReactNode;
}

export const PasswordLoginPage = ({
  config,
  allowRegister = false,
  initialMode = "login",
  registerProps,
  onRegisterAttempt,
  onRegisterSuccess,
  isAuthenticated = false,
  redirectTo,
  translate,
  localeSwitcher,
  children,
  ...loginFormProps
}: PasswordLoginPageProps) => {
  const t = useAuthT();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  if (isAuthenticated) {
    return <Navigate to={redirectTo ?? config.afterLoginRoute} replace />;
  }

  return (
    <AuthLayout config={config} translate={translate ?? t} localeSwitcher={localeSwitcher}>
      {mode === "login" || !allowRegister ? (
        <LoginForm config={config} showRegisterLink={!allowRegister} {...loginFormProps} />
      ) : (
        <RegisterForm
          config={config}
          showLoginLink={false}
          {...registerProps}
          onRegisterAttempt={onRegisterAttempt}
          onRegisterSuccess={onRegisterSuccess}
        />
      )}
      {allowRegister ? (
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          {mode === "login" ? (
            <>
              {t("auth.login.noAccount")}{" "}
              <button type="button" style={LINK_BUTTON_STYLE} onClick={() => setMode("register")}>
                {t("auth.login.signUp")}
              </button>
            </>
          ) : (
            <>
              {t("auth.register.haveAccount")}{" "}
              <button type="button" style={LINK_BUTTON_STYLE} onClick={() => setMode("login")}>
                {t("auth.register.signIn")}
              </button>
            </>
          )}
        </div>
      ) : null}
      {children}
    </AuthLayout>
  );
};

export default PasswordLoginPage;
