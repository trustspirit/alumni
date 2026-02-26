import { memo } from 'react';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> {
  href: string;
  children: ReactNode;
  className?: string;
}

export const ExternalLink = memo(function ExternalLink({
  href,
  children,
  className,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-byuh-crimson transition-colors hover:text-byuh-crimson-dark', className)}
      {...props}
    >
      {children}
    </a>
  );
});
