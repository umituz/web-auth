import { BrandLogo } from "./BrandLogo";
import { cn } from "@umituz/web-design-system/utils/cn";
import { AUTH_KEYS } from "../utils/i18nKeys";
import type { AuthLayoutProps, Translate } from "../types/auth";

const DEFAULT_STRINGS: Record<string, string> = {
  [AUTH_KEYS.layout.backToHome]: "Back to home",
  [AUTH_KEYS.layout.orContinueWith]: "Or continue with",
  [AUTH_KEYS.layout.allRightsReserved]: "All rights reserved.",
};

export const AuthLayout = ({
  config,
  translate,
  onSocialLogin,
  children,
}: AuthLayoutProps) => {
  const t: Translate = translate ?? ((key) => DEFAULT_STRINGS[key] ?? key);
  const homeRoute = config.homeRoute ?? config.afterLoginRoute;
  const footerLinks = config.footerLinks ?? [];

  return (
    <div className="uauth-root uauth-auth">
      <header className="uauth-auth__header">
        <div className="uauth-auth__brand">
          <BrandLogo size={32} />
          <span className="uauth-auth__brand-name">{config.brandName}</span>
        </div>

        {homeRoute && (
          <a href={homeRoute} className="uauth-auth__home-link">
            {t(AUTH_KEYS.layout.backToHome)}
          </a>
        )}
      </header>

      <main className="uauth-auth__main">
        <div className="uauth-auth__column">
          <div className="uauth-auth__card">
            {config.brandTagline && (
              <p className="uauth-auth__tagline">
                {config.brandTagline}
              </p>
            )}

            {children}
          </div>

          {config.showSocialLogin && config.socialProviders && config.socialProviders.length > 0 && (
            <div className="uauth-auth__social">
              <div className="uauth-divider-row">
                <span className="uauth-divider-row__label">
                  {t(AUTH_KEYS.layout.orContinueWith)}
                </span>
              </div>

              <div className="uauth-social-grid">
                {config.socialProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    className={cn("uauth-social-btn")}
                    onClick={() => onSocialLogin?.(provider.id)}
                  >
                    <span className="uauth-social-btn__icon">{provider.icon}</span>
                    <span>{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="uauth-auth__footer">
        <div className="uauth-auth__footer-inner">
          <p>
            © {new Date().getFullYear()} {config.brandName}. {t(AUTH_KEYS.layout.allRightsReserved)}
          </p>
          {footerLinks.length > 0 && (
            <div className="uauth-auth__footer-links">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="uauth-auth__footer-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
