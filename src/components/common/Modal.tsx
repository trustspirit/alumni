import { memo, useEffect, useId } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export const Modal = memo(function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('relative z-10 mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl', className)}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="font-heading text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100" aria-label="Close">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});
