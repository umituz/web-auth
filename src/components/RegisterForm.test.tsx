import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { RegisterForm } from "./RegisterForm";
import type {
  AuthConfig,
  RegisterExtraFieldsRenderArgs,
  RegisterFormProps,
} from "../types/auth";

const config: AuthConfig = {
  brandName: "Storyora",
  loginRoute: "/login",
  registerRoute: "/register",
  termsRoute: "/terms",
  privacyRoute: "/privacy",
  afterLoginRoute: "/app",
  afterLogoutRoute: "/login",
};

const registered = { id: "u-1", email: "jane@storyora.io", name: "Jane" };

const mount = (props: Partial<RegisterFormProps> = {}) =>
  render(
    <MemoryRouter>
      <RegisterForm
        config={config}
        showTerms={false}
        showLoginLink={false}
        showSocialLogin={false}
        requirePasswordConfirm={false}
        onRegisterAttempt={vi.fn().mockResolvedValue(registered)}
        {...props}
      />
    </MemoryRouter>,
  );

const fillBuiltIns = () => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jane" } });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "jane@storyora.io" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "longenough1" },
  });
};

const referralSlot = ({ values, setValue }: RegisterExtraFieldsRenderArgs) => (
  <div data-testid="extra-slot">
    <input
      aria-label="Referral code"
      value={values.referral ?? ""}
      onChange={(e) => setValue("referral", e.target.value)}
    />
  </div>
);

describe("RegisterForm extraFields slot", () => {
  it("renders the slot between the built-in fields and the submit button", () => {
    mount({ extraFields: referralSlot });

    const slot = screen.getByTestId("extra-slot");
    const emailField = screen.getByLabelText("Email");
    const submit = screen.getByRole("button", { name: "Create account" });

    expect(
      emailField.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      slot.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("leaves the built-in form untouched when the slot is absent", async () => {
    const onRegisterAttempt = vi.fn().mockResolvedValue(registered);
    mount({ onRegisterAttempt });

    expect(screen.queryByTestId("extra-slot")).toBeNull();

    fillBuiltIns();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(onRegisterAttempt).toHaveBeenCalledTimes(1));
    expect(onRegisterAttempt).toHaveBeenCalledWith({
      email: "jane@storyora.io",
      password: "longenough1",
      name: "Jane",
    });
  });

  it("seeds the slot values from initialValues", () => {
    mount({ extraFields: referralSlot, initialValues: { referral: "ADA-42" } });

    expect(screen.getByLabelText("Referral code")).toHaveProperty("value", "ADA-42");
  });

  it("carries the slot values into the register metadata", async () => {
    const onRegisterAttempt = vi.fn().mockResolvedValue(registered);
    mount({
      extraFields: referralSlot,
      initialValues: { referral: "SEEDED" },
      onRegisterAttempt,
    });

    fillBuiltIns();
    fireEvent.change(screen.getByLabelText("Referral code"), {
      target: { value: "HANGORA-7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(onRegisterAttempt).toHaveBeenCalledTimes(1));
    expect(onRegisterAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "jane@storyora.io",
        metadata: { referral: "HANGORA-7" },
      }),
    );
  });

  it("does not attach metadata when the slot is absent even with initialValues", async () => {
    const onRegisterAttempt = vi.fn().mockResolvedValue(registered);
    mount({ initialValues: { referral: "ORPHAN" }, onRegisterAttempt });

    fillBuiltIns();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(onRegisterAttempt).toHaveBeenCalledTimes(1));
    expect(onRegisterAttempt).toHaveBeenCalledWith({
      email: "jane@storyora.io",
      password: "longenough1",
      name: "Jane",
    });
  });
});
