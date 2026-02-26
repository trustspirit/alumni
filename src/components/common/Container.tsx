import { memo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main';
}

export const Container = memo(function Container({
  children,
  className,
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component className={cn('mx-auto w-full max-w-[1240px] px-5', className)}>
      {children}
    </Component>
  );
});
