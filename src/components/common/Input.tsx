import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/cn';

function sanitize(value: string): string {
  return value.replace(/[<>]/g, '');
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  error?: string;
  label?: string;
  required?: boolean;
  onChange?: (value: string) => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, label, required, className, id, onChange, ...props },
  ref,
) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(sanitize(e.target.value));
    },
    [onChange],
  );

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-primary">
          {label} {required && <span className="text-byuh-crimson">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        onChange={handleChange}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  error?: string;
  label?: string;
  required?: boolean;
  onChange?: (value: string) => void;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error, label, required, className, id, onChange, ...props },
  ref,
) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(sanitize(e.target.value));
    },
    [onChange],
  );

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-primary">
          {label} {required && <span className="text-byuh-crimson">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        onChange={handleChange}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
