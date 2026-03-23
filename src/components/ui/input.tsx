'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: string;
  filled?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, suffix, filled = true, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              'w-full rounded-lg px-4 py-4 text-sm transition-all',
              'placeholder:text-zinc-400',
              'focus:outline-none focus:ring-2 focus:ring-primary/40',
              'disabled:cursor-not-allowed disabled:opacity-50',
              filled
                ? 'border-none bg-surface-container-highest text-on-surface'
                : 'border border-zinc-300 bg-white',
              icon && 'pl-10',
              error && 'ring-2 ring-red-500/40',
              className,
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
