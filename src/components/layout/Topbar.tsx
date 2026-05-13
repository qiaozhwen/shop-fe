import { Bell, LogOut, Search, User as UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { modules } from '@/config/nav';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/modules/authApi';

function useBreadcrumb() {
  const { pathname } = useLocation();
  const mod = modules.find((m) => pathname === m.path || pathname.startsWith(m.path + '/'));
  if (!mod) return null;
  const item = mod.groups.flatMap((g) => g.items).find((it) => it.path === pathname);
  return { module: mod.label, item: item?.label };
}

export function Topbar() {
  const bc = useBreadcrumb();
  const navigate = useNavigate();
  // TODO: wire useAppStore.currentStoreId — store only exposes currentStoreId (number), no name
  const storeName = '总店';

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken ?? undefined;
    try { await authApi.logout(refreshToken); } catch { /* 忽略后端失败，本地清空就够 */ }
    useAuthStore.getState().clear();
    toast.success('已退出登录');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center px-6 gap-4">
      <div className="text-[13px] text-text-2">
        {bc ? (
          <>
            <span>{bc.module}</span>
            {bc.item && (
              <>
                <span className="mx-1.5 text-text-3">/</span>
                <span className="text-text font-medium">{bc.item}</span>
              </>
            )}
          </>
        ) : null}
      </div>
      <div className="flex-1" />
      <button className="inline-flex items-center gap-2 px-3 h-8 rounded-[8px] border border-border text-[13px] text-text-2 hover:bg-[#F1F3EE]">
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full w-2 h-2 bg-primary" />
        </span>
        {storeName}
      </button>
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
        <Input className="h-8 w-56 pl-8 text-[12px]" placeholder="搜索订单 / 会员 / SKU" />
      </div>
      <button className="relative w-8 h-8 rounded-[8px] hover:bg-[#F1F3EE] flex items-center justify-center text-text-2">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="账户菜单"
          >
            <Avatar>
              <AvatarFallback>QZ</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-44">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-text">乔振</span>
              <span className="text-[11px] text-text-3 mt-0.5">店长</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => toast.info('个人资料 — 待开发')}>
            <UserIcon size={14} className="mr-2" />
            个人资料
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleLogout}
            className="text-danger focus:text-danger focus:bg-danger/10"
          >
            <LogOut size={14} className="mr-2" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
