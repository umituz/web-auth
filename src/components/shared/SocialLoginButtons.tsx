import { Button } from "@umituz/web-design-system/atoms";
import { GoogleIcon, AppleIcon } from "./SocialProviderIcons";

export type SocialProviderId = 'google' | 'apple';

export interface SocialLoginButtonsProps {
  onProvider: (id: SocialProviderId) => void;
  translate: (key: string) => string;
  disabled?: boolean;
}

const SOCIAL_PROVIDERS: ReadonlyArray<{
  id: SocialProviderId;
  labelKey: string;
  Icon: typeof GoogleIcon;
}> = [
  { id: 'google', labelKey: 'auth.social.continueWithGoogle', Icon: GoogleIcon },
  { id: 'apple', labelKey: 'auth.social.continueWithApple', Icon: AppleIcon },
];

export const SocialLoginButtons = ({
  onProvider,
  translate,
  disabled = false,
}: SocialLoginButtonsProps) => {
  return (
    <div className="uauth-social-grid">
      {SOCIAL_PROVIDERS.map(({ id, labelKey, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          onClick={() => onProvider(id)}
          disabled={disabled}
          aria-label={translate(labelKey)}
          className="uauth-social-grid__btn"
        >
          <Icon className="uauth-social-grid__icon" aria-hidden="true" />
          {translate(labelKey)}
        </Button>
      ))}
    </div>
  );
};
