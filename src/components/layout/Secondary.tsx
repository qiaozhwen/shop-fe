import { Link, useLocation } from 'react-router-dom';
import { modules } from '@/config/nav';
import { cn } from '@/lib/cn';

export function Secondary() {
  const { pathname } = useLocation();
  const current =
    modules.find((m) => pathname === m.path || pathname.startsWith(m.path + '/')) ?? modules[0];
  return (
    <aside className="hidden lg:flex w-[200px] shrink-0 bg-surface border-r border-border flex-col">
      <div className="px-4 py-4 border-b border-border">
        <div className="text-[14px] font-semibold text-text">{current.label}</div>
        <div className="text-[12px] text-text-3 mt-0.5">{current.sub}</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {current.groups.map((g) => (
          <div key={g.label} className="px-3 mb-3">
            <div className="px-2 mb-1.5 text-[10px] uppercase tracking-wider text-text-3 font-semibold">
              {g.label}
            </div>
            {g.items.map((it) => {
              const active = pathname === it.path;
              return (
                <Link
                  key={it.key}
                  to={it.path}
                  className={cn(
                    'block px-2.5 h-8 leading-8 rounded-[8px] text-[13px] text-text-2 hover:bg-[#F1F3EE]',
                    active && 'bg-primary-50 text-primary font-medium',
                  )}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
