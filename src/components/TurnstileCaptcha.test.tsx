import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { TurnstileWidget } from "./shared/TurnstileWidget";
import type { AuthConfig, LoginFormProps, RegisterFormProps } from "../types/auth";

const config: AuthConfig = {
  brandName: "Storyora",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const user = { id: "u-1", email: "jane@storyora.io", name: "Jane" };

let renderOptions: Record<string, unknown> | null = null;
let removeWidget: ReturnType<typeof vi.fn>;

beforeEach(() => {
  renderOptions = null;
  removeWidget = vi.fn();
  window.turnstile = {
    render: vi.fn((_el: HTMLElement, options: Record<string, unknown>) => {
      renderOptions = options;
      return "w-1";
    }),
    remove: removeWidget,
  } as unknown as typeof window.turnstile;
});

afterEach(() => {
  delete window.turnstile;
  document.querySelectorAll("script").forEach((s) => s.remove());
});

const widgetReady = () => waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());

const emitToken = async (token: string | null) => {
  const callback = renderOptions?.callback as (token: string | null) => void;
  await act(async () => {
    callback(token);
  });
};

describe('TurnstileWidget', () => {
  it('renders the widget container through the turnstile api', async () => {
    const onToken = vi.fn();
    const { container } = render(<TurnstileWidget siteKey="site-key-1" onToken={onToken} />);
    await widgetReady();
    expect(window.turnstile?.render).toHaveBeenCalledTimes(1);
    expect((renderOptions as Record<string, unknown>)?.sitekey).toBe("site-key-1");
    expect(container.querySelector(".uauth-turnstile")).not.toBeNull();

    await emitToken("tok-1");
    expect(onToken).toHaveBeenCalledWith("tok-1");

    const expired = renderOptions?.["expired-callback"] as () => void;
    await act(async () => {
      expired();
    });
    expect(onToken).toHaveBeenCalledWith(null);
  });

  it('removes the widget on unmount and clears the token', async () => {
    const onToken = vi.fn();
    const { unmount } = render(<TurnstileWidget siteKey="site-key-1" onToken={onToken} />);
    await widgetReady();
    unmount();
    expect(removeWidget).toHaveBeenCalledWith("w-1");
    expect(onToken).toHaveBeenCalledWith(null);
  });
});

describe('LoginForm captcha', () => {
  const mount = (props: Partial<LoginFormProps> = {}) =>
    render(
      <MemoryRouter>
        <LoginForm
          config={config}
          showRememberMe={false}
          showForgotPassword={false}
          showRegisterLink={false}
          showSocialLogin={false}
          captchaSiteKey="site-key-1"
          {...props}
        />
      </MemoryRouter>,
    );

  const fill = () => {
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@storyora.io" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "longenough1" } });
  };

  it('blocks submit until the widget produces a token', async () => {
    const onLoginAttempt = vi.fn().mockResolvedValue(user);
    mount({ onLoginAttempt });
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onLoginAttempt).not.toHaveBeenCalled();
    expect(await screen.findByText("Please complete the verification to continue.")).toBeTruthy();

    await emitToken("tok-1");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(onLoginAttempt).toHaveBeenCalledTimes(1));
    expect(onLoginAttempt).toHaveBeenCalledWith({
      email: "jane@storyora.io",
      password: "longenough1",
      captchaToken: "tok-1",
    });
  });

  it('refreshes the widget after a failed attempt', async () => {
    const onLoginAttempt = vi.fn().mockRejectedValue(new Error("nope"));
    mount({ onLoginAttempt });
    fill();
    await widgetReady();
    await emitToken("tok-1");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(onLoginAttempt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(2));
  });
});

describe('RegisterForm captcha', () => {
  const mount = (props: Partial<RegisterFormProps> = {}) =>
    render(
      <MemoryRouter>
        <RegisterForm
          config={config}
          showTerms={false}
          showLoginLink={false}
          showSocialLogin={false}
          requirePasswordConfirm={false}
          requireName
          captchaSiteKey="site-key-1"
          onRegisterAttempt={vi.fn().mockResolvedValue(user)}
          {...props}
        />
      </MemoryRouter>,
    );

  const fill = () => {
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@storyora.io" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "longenough1" } });
  };

  it('passes the captcha token through the register payload', async () => {
    const onRegisterAttempt = vi.fn().mockResolvedValue(user);
    mount({ onRegisterAttempt });
    fill();
    await widgetReady();
    await emitToken("tok-2");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(onRegisterAttempt).toHaveBeenCalledTimes(1));
    expect(onRegisterAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ captchaToken: "tok-2" }),
    );
  });

  it('blocks submit without a token', async () => {
    const onRegisterAttempt = vi.fn().mockResolvedValue(user);
    mount({ onRegisterAttempt });
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(onRegisterAttempt).not.toHaveBeenCalled();
    expect(await screen.findByText("Please complete the verification to continue.")).toBeTruthy();
  });
});
