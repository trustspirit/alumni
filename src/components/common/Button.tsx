import { memo } from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-byuh-crimson text-white hover:bg-byuh-crimson-dark',
  secondary: 'bg-byuh-gold text-white hover:bg-byuh-gold-light',
  outline: 'border-2 border-byuh-crimson text-byuh-crimson hover:bg-byuh-crimson hover:text-white',
} as const;

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
} as const;

interface ButtonBaseProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton extends ButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: never;
  to?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  to?: never;
}

interface ButtonAsRouterLink extends ButtonBaseProps {
  to: string;
  href?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsRouterLink;

export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center rounded-lg font-heading font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-byuh-crimson focus:ring-offset-2',
    variants[variant],
    sizes[size],
    className,
  );

  if ('href' in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <a
        href={href}
        className={baseStyles}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  if ('to' in props && props.to) {
    const { to, ...rest } = props as ButtonAsRouterLink;
    return (
      <Link to={to} className={baseStyles} {...rest}>
        {children}
      </Link>
    );
  }

  const { href: _h, to: _t, ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={baseStyles} {...buttonProps}>
      {children}
    </button>
  );
});
