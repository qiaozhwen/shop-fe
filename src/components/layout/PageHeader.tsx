import * as React from 'react';

type Props = { title: string; sub?: string; actions?: React.ReactNode };

export function PageHeader({ title, sub, actions }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 className="text-[20px] sm:text-[24px] font-bold text-text leading-tight">{title}</h1>
        {sub && <p className="text-[13px] text-text-3 mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
