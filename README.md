# @umituz/web-auth

Frontend auth module: `AuthLayout` + Login/Register/Forgot/Reset forms, a `SessionProvider`
with an `AuthAdapter` seam, an org switcher, and a demo login. The package performs no
authentication itself — the host adapts its backend through `AuthAdapter`; the forms render
whatever the host wires into `onLogin`-style callbacks.

Source-shipped (no build step). TypeScript + React 18/19, styling via `uauth-*` classes on
`@umituz/web-design-system` color tokens.

## Subpaths

| Export | Contents |
| --- | --- |
| `.` | Everything below in one barrel |
| `./components` | `AuthLayout`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, shared inputs (`EmailInput`, `PasswordInput`, `PasswordStrengthIndicator`, `AuthErrorBanner`, `SocialLoginButtons`, `SocialProviderIcons`) |
| `./hooks` | `useAuth` + `AuthProvider` interface (backend-action contract) |
| `./utils` | Validators (`isValidEmail`, `validateLogin`, …), password strength, email masking, `generateResetToken`, i18n/validation key catalogs |
| `./types` | All public types (`User`, `LoginCredentials`, `RegisterData`, form props, `AuthConfig`, …) |
| `./session` | `SessionProvider`, `useSession`, `AuthAdapter`/`SessionUser` types, `createInMemoryAuthAdapter`, `DemoLogin`, `OrgSwitcher` |
| `./styles.css` | The stylesheet (import once, after the design-system stylesheet) |

## Quickstart

```bash
npm install @umituz/web-auth
# peers: react, react-dom, react-router-dom
```

1. Import styles once, after the design-system stylesheet:

   ```ts
   import "@umituz/web-design-system/styles.css";
   import "@umituz/web-auth/styles.css";
   ```

2. Implement the adapter seam (or use the in-memory one for demos):

   ```ts
   import { createInMemoryAuthAdapter } from "@umituz/web-auth/session";
   ```

3. Mount the session provider above the routes:

   ```tsx
   import { SessionProvider } from "@umituz/web-auth/session";

   <SessionProvider adapter={adapter}>
     <App />
   </SessionProvider>
   ```

4. Render the auth screens:

   ```tsx
   import { AuthLayout, LoginForm } from "@umituz/web-auth/components";

   <AuthLayout>
     <LoginForm onLogin={async (credentials) => { /* call your API */ }} />
   </AuthLayout>
   ```

5. Read the session anywhere:

   ```ts
   import { useSession } from "@umituz/web-auth/session";
   ```

`useAuth` (from `./hooks`) is the backend-action contract used by the forms
(`login`/`register`/`forgotPassword`/`resetPassword`); `DemoLogin` and `OrgSwitcher` cover
multi-tenant demo flows.

## Styles

- Class prefix `uauth-*`, spacing scale declared as `--uauth-space-1…8` (4–40px).
- Colors come from `@umituz/web-design-system` custom properties (`--color-*`); theme the
  screens by overriding those tokens (e.g. `--color-primary`).

## Peers

`react` and `react-dom` `^18 || ^19`, `react-router-dom` `^6 || ^7`.

## Development

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src
npm test            # vitest run
```
