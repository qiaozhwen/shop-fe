import * as React from 'react';
import { cn } from '@/lib/cn';
export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('rounded-[12px] border border-border bg-surface shadow-[var(--shadow-sm)]', className)} {...p} />;
export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)} {...p} />;
export const CardTitle = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('text-[14px] font-semibold text-text', className)} {...p} />;
export const CardSub = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('text-[12px] text-text-3', className)} {...p} />;
export const CardBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('px-5 py-4', className)} {...p} />;
