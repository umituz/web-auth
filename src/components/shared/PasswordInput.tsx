import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@umituz/web-design-system/atoms";
import { Button } from "@umituz/web-design-system/atoms";
import { cn } from "@umituz/web-design-system/utils/cn";

export interface PasswordInputProps {
  id: string;
  labelKey: string;
  placeholderKey: string;
  value: string;
  onChange: (value: string) => void;
  translate: (key: string) => string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  className?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      labelKey,
      placeholderKey,
      value,
      onChange,
      translate,
      autoComplete = "current-password",
      disabled = false,
      required = false,
      error = null,
      className,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={cn("uauth-field", className)}>
        <label htmlFor={id} className="uauth-field__label">
          {translate(labelKey)}
          {required && (
            <span className="uauth-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="uauth-password-wrap">
          <Input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            value={value}
            placeholder={translate(placeholderKey)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="uauth-input--with-toggle"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            onClick={() => setVisible((prev) => !prev)}
            disabled={disabled}
            aria-label={
              visible
                ? translate('auth.a11y.hidePassword')
                : translate('auth.a11y.showPassword')
            }
            className="uauth-password-toggle"
          >
            {visible ? (
              <EyeOff className="uauth-password-toggle__icon" aria-hidden="true" />
            ) : (
              <Eye className="uauth-password-toggle__icon" aria-hidden="true" />
            )}
          </Button>
        </div>
        {error && (
          <p
            id={`${id}-error`}
            className="uauth-field__error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
