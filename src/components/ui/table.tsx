import * as React from 'react';
import { cn } from '@/lib/cn';
export const Table = (p: React.HTMLAttributes<HTMLTableElement>) => <table className={cn('w-full text-[13px]', p.className)} {...p} />;
export const Thead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('bg-[#FAFBF7]', p.className)} {...p} />;
export const Tbody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const Tr = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-b border-border hover:bg-[#FAFBF7]', p.className)} {...p} />;
export const Th = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn('text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-3', p.className)} {...p} />;
export const Td = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-5 py-3 text-text', p.className)} {...p} />;
