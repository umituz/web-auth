import { UserRound } from "lucide-react";
import { Button } from "@umituz/web-design-system/atoms";
import { useT } from "@umituz/web-localization/react";
import { SESSION_KEYS } from "./utils/i18nKeys";

export interface DemoLoginProps {
  onDemo: (userId: string) => void | Promise<void>;
  userId: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  disabled?: boolean;
  className?: string;
}

export const DemoLogin = ({
  onDemo,
  userId,
  label,
  variant = "outline",
  size = "default",
  disabled = false,
  className,
}: DemoLoginProps) => {
  const t = useT();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      onClick={() => void onDemo(userId)}
    >
      <UserRound aria-hidden="true" />
      {label ?? t(SESSION_KEYS.demoLogin.action)}
    </Button>
  );
};

export default DemoLogin;
