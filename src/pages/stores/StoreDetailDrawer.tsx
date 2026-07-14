import { Link } from 'react-router-dom';
import type { Store } from '@/types/store';
import { STORE_STATUS_LABEL } from '@/types/store';
import { STAFF_ROLE_LABEL } from '@/types/people';
import { ORDER_STATUS_LABEL } from '@/types/order';
import { useStaff } from '@/hooks/usePeople';
import { useInventory } from '@/hooks/useInventory';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { Pill } from '@/components/ui/pill';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Props {
  open: boolean;
  store: Store | null;
  onClose: () => void;
}

type StatusTone = 'up' | 'down' | 'warn';
const STATUS_TONE: Record<string, StatusTone> = {
  OPEN: 'up',
  CLOSED: 'down',
  RENOVATING: 'warn',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <span className="w-24 flex-shrink-0 text-[12px] text-text-3">{label}</span>
      <span className="text-[13px] text-text">{value}</span>
    </div>
  );
}

function TabHeader({ count, href }: { count: number; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between text-[12px] text-text-3">
      <span>共 {count} 条</span>
      <Link className="font-medium text-primary hover:underline" to={href}>管理全部</Link>
    </div>
  );
}

function TabState({ loading, error, empty }: { loading: boolean; error: boolean; empty: boolean }) {
  if (loading) return <div className="py-10 text-center text-[13px] text-text-3">加载中...</div>;
  if (error) return <div className="py-10 text-center text-[13px] text-danger">数据加载失败，请稍后重试</div>;
  if (empty) return <div className="py-10 text-center text-[13px] text-text-3">暂无数据</div>;
  return null;
}

function StoreStaffTab({ storeId }: { storeId: number }) {
  const { data, isLoading, isError } = useStaff({ storeId, pageSize: 50 });
  const list = data?.list ?? [];
  const state = <TabState loading={isLoading} error={isError} empty={list.length === 0} />;
  if (isLoading || isError || list.length === 0) return state;
  return (
    <div>
      <TabHeader count={data?.total ?? list.length} href="/staff" />
      <div className="divide-y divide-border rounded-[6px] border border-border">
        {list.map((staff) => (
          <div key={staff.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-text">{staff.name}</div>
              <div className="mt-0.5 font-mono text-[11px] text-text-3">{staff.phone}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Pill tone="info">{STAFF_ROLE_LABEL[staff.role] ?? staff.role}</Pill>
              <Pill tone={staff.enabled ? 'up' : 'mute'}>{staff.enabled ? '启用' : '停用'}</Pill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreInventoryTab({ storeId }: { storeId: number }) {
  const { data, isLoading, isError } = useInventory({ storeId, pageSize: 50 });
  const list = data?.list ?? [];
  const state = <TabState loading={isLoading} error={isError} empty={list.length === 0} />;
  if (isLoading || isError || list.length === 0) return state;
  return (
    <div>
      <TabHeader count={data?.total ?? list.length} href="/inventory" />
      <div className="divide-y divide-border rounded-[6px] border border-border">
        {list.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-text">{item.categoryName}</div>
              <div className="mt-0.5 truncate font-mono text-[11px] text-text-3">{item.batchNo}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono text-[13px] font-semibold text-text">{item.quantity} 只</div>
              <div className="mt-0.5 text-[11px] text-text-3">{item.health}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreOrdersTab({ storeId }: { storeId: number }) {
  const { data, isLoading, isError } = useSalesOrders({ storeId, pageSize: 50 });
  const list = data?.list ?? [];
  const state = <TabState loading={isLoading} error={isError} empty={list.length === 0} />;
  if (isLoading || isError || list.length === 0) return state;
  return (
    <div>
      <TabHeader count={data?.total ?? list.length} href="/sales/orders" />
      <div className="divide-y divide-border rounded-[6px] border border-border">
        {list.map((order) => (
          <Link
            key={order.id}
            to={`/sales/orders/${order.id}`}
            className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-bg"
          >
            <div className="min-w-0">
              <div className="truncate font-mono text-[12px] font-medium text-text">{order.orderNo}</div>
              <div className="mt-0.5 text-[11px] text-text-3">{order.createdAt}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[13px] font-semibold">¥{order.payable.toFixed(2)}</span>
              <Pill tone={order.status === 'COMPLETED' ? 'up' : order.status === 'CANCELED' ? 'mute' : 'warn'}>
                {ORDER_STATUS_LABEL[order.status]}
              </Pill>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function StoreDetailDrawer({ open, store, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[560px] max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{store ? `门店详情 — ${store.name}` : '门店详情'}</SheetTitle>
        </SheetHeader>

        {store && (
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">概览</TabsTrigger>
              <TabsTrigger value="staff">员工</TabsTrigger>
              <TabsTrigger value="inventory">库存</TabsTrigger>
              <TabsTrigger value="orders">订单</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="rounded-[8px] border border-border bg-surface px-4">
                <InfoRow label="编码" value={<span className="font-mono">{store.code}</span>} />
                <InfoRow label="门店名称" value={store.name} />
                <InfoRow label="地址" value={store.address} />
                <InfoRow label="电话" value={<span className="font-mono">{store.phone}</span>} />
                <InfoRow label="店长" value={store.ownerName} />
                <InfoRow
                  label="营业时间"
                  value={`${store.openTime ?? '-'} ~ ${store.closeTime ?? '-'}`}
                />
                <InfoRow
                  label="状态"
                  value={
                    <Pill tone={STATUS_TONE[store.status] ?? 'mute'}>
                      {STORE_STATUS_LABEL[store.status]}
                    </Pill>
                  }
                />
                <InfoRow label="备注" value={store.remark || '-'} />
                <InfoRow label="创建时间" value={<span className="text-text-3">{store.createdAt || '-'}</span>} />
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <StoreStaffTab storeId={store.id} />
            </TabsContent>

            <TabsContent value="inventory">
              <StoreInventoryTab storeId={store.id} />
            </TabsContent>

            <TabsContent value="orders">
              <StoreOrdersTab storeId={store.id} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
