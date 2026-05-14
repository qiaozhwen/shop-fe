import * as React from 'react';
import { cn } from '@/lib/cn';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-[8px] border border-border bg-surface px-3 text-[13px] text-text placeholder:text-text-3',
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
