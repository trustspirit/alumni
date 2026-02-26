import { memo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  viewMoreLink?: string;
  viewMoreLabel?: string;
  className?: string;
  align?: 'left' | 'center';
}

export const SectionHeading = memo(function SectionHeading({
  title,
  subtitle,
  viewMoreLink,
  viewMoreLabel,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div className={cn(
      'mb-10',
      align === 'center' && 'text-center',
      className,
    )}>
      <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg text-text-secondary">{subtitle}</p>
      )}
      {viewMoreLink && viewMoreLabel && (
        <Link
          to={viewMoreLink}
          className="mt-4 inline-block text-sm font-semibold text-byuh-crimson transition-colors hover:text-byuh-crimson-dark"
        >
          {viewMoreLabel} →
        </Link>
      )}
    </div>
  );
});
