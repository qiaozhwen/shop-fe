import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const pillVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 h-5 text-[11px] font-medium',
  {
    variants: {
      tone: {
        up:   'bg-[#DCFCE7] text-success',
        down: 'bg-[#FEE2E2] text-danger',
        warn: 'bg-[#FEF3C7] text-warning',
        info: 'bg-[#DBEAFE] text-info',
        mute: 'bg-[#F1F3EE] text-text-2',
      },
    },
    defaultVariants: { tone: 'mute' },
  }
);
export interface PillProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof pillVariants> {}
export const Pill = ({ className, tone, ...p }: PillProps) =>
  <span className={cn(pillVariants({ tone }), className)} {...p} />;
