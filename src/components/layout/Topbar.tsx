import { LogOut, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
import { useAllStores } from '@/hooks/useStores';
import { useAppStore } from '@/store/useAppStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const subject = useAuthStore((state) => state.subject);
  const currentStoreId = useAppStore((state) => state.currentStoreId);
  const setCurrentStore = useAppStore((state) => state.setCurrentStore);
  const { data: stores = [] } = useAllStores();

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
      <Select
        value={currentStoreId == null ? undefined : String(currentStoreId)}
        onValueChange={(value) => setCurrentStore(Number(value))}
      >
        <SelectTrigger className="h-8 w-40 text-[12px]">
          <SelectValue placeholder="选择门店" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={String(store.id)}>{store.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
              <span className="text-[13px] font-medium text-text">{subject?.nickname || subject?.phone || '当前账号'}</span>
              <span className="text-[11px] text-text-3 mt-0.5">{subject?.roles?.join(', ') || '员工'}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate('/account/security')}>
            <ShieldCheck size={14} className="mr-2" />
            账号安全
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
