import * as React from 'react';
import { cn } from '@/lib/cn';
export const Skeleton = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('animate-pulse rounded bg-[#EEF1EA]', className)} {...p} />;
