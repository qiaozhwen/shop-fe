import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/cn';

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const v = value ?? 0;
  const color = v < 20 ? 'var(--danger)' : v < 40 ? 'var(--accent)' : 'var(--primary)';
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn('relative h-[5px] w-full overflow-hidden rounded-[3px] bg-[#F1F3EE]', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-transform"
        style={{ background: color, transform: `translateX(-${100 - v}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = 'Progress';
