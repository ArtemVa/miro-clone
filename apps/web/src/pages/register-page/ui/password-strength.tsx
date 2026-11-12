import { cn } from 'cn';

import type { PasswordStrength as Strength } from '@/core/auth';

import { BAR_COLORS, HINTS, STRENGTH_STEPS } from '../model/constants';

type PasswordStrengthProps = {
  strength: Strength;
};

export const PasswordStrength = ({ strength }: PasswordStrengthProps) => (
  <span className="flex flex-col gap-1.5">
    <span className="flex gap-1" aria-hidden="true">
      {STRENGTH_STEPS.map((step) => (
        <span
          key={step}
          className={cn('h-1 flex-1 rounded-full bg-muted transition-colors', step <= strength && BAR_COLORS[strength])}
        />
      ))}
    </span>
    <span>{HINTS[strength]}</span>
  </span>
);
