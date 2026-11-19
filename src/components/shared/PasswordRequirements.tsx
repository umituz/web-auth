import { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@umituz/web-design-system/utils/cn';
import { evaluatePasswordRules, type PasswordRulesOptions } from '../../utils/passwordRules';
import { useAuthT } from '../../utils/messages';
import type { Translate } from '../../types/auth';

export interface PasswordRequirementsProps {
  password: string;
  options?: PasswordRulesOptions;
  translate?: Translate;
  className?: string;
}

export const PasswordRequirements = ({
  password,
  options,
  translate,
  className,
}: PasswordRequirementsProps) => {
  const defaultT = useAuthT();
  const t = translate ?? defaultT;

  const evaluation = useMemo(
    () => evaluatePasswordRules(password, options),
    [password, options],
  );

  return (
    <ul
      className={cn('uauth-req-list', className)}
      aria-label={t('auth.passwordRules.title', undefined) || 'Password requirements'}
    >
      {evaluation.rules.map((rule) => {
        const label = t(rule.labelKey, { min: options?.minLength ?? 8 }) || rule.defaultLabel;
        return (
          <li
            key={rule.id}
            className={cn(
              'uauth-req-item',
              rule.passed ? 'uauth-req-item--passed' : 'uauth-req-item--pending',
            )}
          >
            {rule.passed ? (
              <Check className="uauth-req-item__icon uauth-req-item__icon--passed" aria-hidden="true" />
            ) : (
              <Circle className="uauth-req-item__icon uauth-req-item__icon--pending" aria-hidden="true" />
            )}
            <span className="uauth-req-item__text">{label}</span>
          </li>
        );
      })}
    </ul>
  );
};
