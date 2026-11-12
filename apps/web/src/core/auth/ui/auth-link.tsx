import type { ReactNode } from 'react';
import { Link } from 'react-router';

type AuthLinkProps = {
  to: string;
  text: ReactNode;
  linkText: string;
};

export const AuthLink = ({ to, text, linkText }: AuthLinkProps) => (
  <p className="text-center text-sm text-muted-foreground">
    {text}{' '}
    <Link to={to} className="font-medium text-foreground underline-offset-4 hover:underline">
      {linkText}
    </Link>
  </p>
);
