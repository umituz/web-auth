import { AlertCircle } from "lucide-react";
import { cn } from "@umituz/web-design-system/utils/cn";

export interface AuthErrorBannerProps {
  message?: string | null;
  translate: (key: string) => string;
  className?: string;
}

export const AuthErrorBanner = ({ message, translate, className }: AuthErrorBannerProps) => {
  if (!message) return null;

  const looksLikeKey = message.includes('.') && !/\s/.test(message.trim());
  const resolved = looksLikeKey ? translate(message) : message;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn("uauth-form-alert", className)}
    >
      <AlertCircle className="uauth-form-alert__icon" aria-hidden="true" />
      <span>{resolved}</span>
    </div>
  );
};
