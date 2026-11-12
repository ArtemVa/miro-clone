import { cn } from 'cn';

type LogoProps = {
  withText?: boolean;
  className?: string;
};

export const Logo = ({ withText = true, className }: LogoProps) => (
  <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <rect x="2" y="2" width="13" height="13" rx="4" className="fill-primary" />
      <rect x="9" y="9" width="13" height="13" rx="4" className="fill-primary" fillOpacity=".4" />
    </svg>
    {withText && 'Tandem'}
  </span>
);
