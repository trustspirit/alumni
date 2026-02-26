import { memo } from 'react';
import { cn } from '@/lib/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)} role="status">
      <div className={cn('animate-spin rounded-full border-4 border-byuh-crimson border-t-transparent', sizes[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
});
