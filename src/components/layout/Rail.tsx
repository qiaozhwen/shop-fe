import { Link, useLocation } from 'react-router-dom';
import { modules, settingsItem } from '@/config/nav';
import { cn } from '@/lib/cn';

export function Rail() {
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');
  return (
    <aside className="w-[60px] shrink-0 bg-rail flex flex-col items-center py-3 gap-1">
      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-[13px] font-bold mb-2">
        SH
      </div>
      {modules.map((m) => {
        const Icon = m.icon;
        const active = isActive(m.path);
        return (
          <Link
            key={m.key}
            to={m.path}
            title={m.label}
            className={cn(
              'relative w-10 h-10 rounded-[10px] flex items-center justify-center text-white/70 hover:text-white hover:bg-rail-2 transition',
              active && 'text-white bg-rail-2',
            )}
          >
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />
            )}
            <Icon size={18} strokeWidth={1.8} />
          </Link>
        );
      })}
      <div className="mt-auto">
        <Link
          to={settingsItem.path}
          title="设置"
          className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white/70 hover:text-white hover:bg-rail-2"
        >
          <settingsItem.icon size={18} strokeWidth={1.8} />
        </Link>
      </div>
    </aside>
  );
}
