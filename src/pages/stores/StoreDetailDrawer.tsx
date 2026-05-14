import type { Store } from '@/types/store';
import { STORE_STATUS_LABEL } from '@/types/store';
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
              <div className="py-12 text-center text-[13px] text-text-3">待 Sprint 后续接入</div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="py-12 text-center text-[13px] text-text-3">待 Sprint 后续接入</div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="py-12 text-center text-[13px] text-text-3">待 Sprint 后续接入</div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
