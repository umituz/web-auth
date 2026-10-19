import { forwardRef } from "react";
import { Input } from "@umituz/web-design-system/atoms";
import { cn } from "@umituz/web-design-system/utils/cn";

export interface EmailInputProps {
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

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  (
    {
      id,
      labelKey,
      placeholderKey,
      value,
      onChange,
      translate,
      autoComplete = "email",
      disabled = false,
      required = false,
      error = null,
      className,
    },
    ref,
  ) => {
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
        <Input
          ref={ref}
          id={id}
          type="email"
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          value={value}
          placeholder={translate(placeholderKey)}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
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

EmailInput.displayName = "EmailInput";
