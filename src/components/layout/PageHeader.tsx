import * as React from 'react';

type Props = { title: string; sub?: string; actions?: React.ReactNode };

export function PageHeader({ title, sub, actions }: Props) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="text-[24px] font-bold text-text leading-tight">{title}</h1>
        {sub && <p className="text-[13px] text-text-3 mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
