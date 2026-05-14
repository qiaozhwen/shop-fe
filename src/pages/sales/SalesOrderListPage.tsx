import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useSalesOrders, useSalesOrderMutations } from '@/hooks/useSalesOrders';
import type { OrderStatus, SalesOrder, SalesOrderItem } from '@/types/order';
import { ORDER_STATUS_LABEL, PAY_METHOD_LABEL } from '@/types/order';

import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/data/KpiCard';
import { DataTable } from '@/components/data/DataTable';
import { StatusPill } from '@/components/data/StatusPill';
import type { StatusKey } from '@/components/data/StatusPill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

const ORDER_STATUS_TO_PILL: Record<OrderStatus, StatusKey> = {
  PENDING: 'pending',
  PAID: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELED: 'cancelled',
  REFUNDED: 'refunded',
};

const STATUS_TABS: Array<{ key: OrderStatus | undefined; label: string }> = [
  { key: undefined, label: '全部' },
  { key: 'PENDING', label: ORDER_STATUS_LABEL.PENDING },
  { key: 'PAID', label: ORDER_STATUS_LABEL.PAID },
  { key: 'PROCESSING', label: ORDER_STATUS_LABEL.PROCESSING },
  { key: 'READY', label: ORDER_STATUS_LABEL.READY },
  { key: 'COMPLETED', label: ORDER_STATUS_LABEL.COMPLETED },
];

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const { data, isLoading } = useSalesOrders({ page, pageSize, keyword, status });
  const { updateStatus } = useSalesOrderMutations();

  const list = data?.list ?? [];
  const revenue = list.reduce((s, o) => s + o.payable, 0);
  const refunds = list.filter((o) => o.status === 'REFUNDED').length;
  const totalPages = Math.ceil((data?.total ?? 0) / pageSize) || 1;

  const columns: ColumnDef<SalesOrder>[] = [
    {
      header: '订单号',
      accessorKey: 'orderNo',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    {
      header: '会员/客户',
      id: 'member',
      cell: ({ row }) => row.original.memberName ?? row.original.customerPhone ?? '-',
    },
    {
      header: '品类摘要',
      id: 'items',
      cell: ({ row }) =>
        row.original.items.map((i: SalesOrderItem) => `${i.categoryName}×${i.quantity}`).join(', '),
    },
    {
      header: '应收',
      accessorKey: 'payable',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-danger">¥{getValue<number>().toFixed(2)}</span>
      ),
    },
    {
      header: '支付',
      accessorKey: 'payMethod',
      cell: ({ getValue }) => {
        const v = getValue<string | undefined>();
        return v ? PAY_METHOD_LABEL[v as keyof typeof PAY_METHOD_LABEL] : '-';
      },
    },
    {
      header: '状态',
      accessorKey: 'status',
      cell: ({ getValue }) => (
        <StatusPill status={ORDER_STATUS_TO_PILL[getValue<OrderStatus>()]} />
      ),
    },
    {
      header: '下单时间',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-text-3">{getValue<string>()}</span>
      ),
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-1 flex-wrap">
            <Button variant="link" size="sm" onClick={() => navigate(`/sales/orders/${r.id}`)}>
              <Eye size={12} />
              详情
            </Button>
            {r.status === 'PENDING' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateStatus.mutate(
                    { id: r.id, status: 'PAID' },
                    { onSuccess: () => toast.success('已标记为已付款') },
                  )
                }
              >
                收款
              </Button>
            )}
            {(r.status === 'PAID' || r.status === 'PROCESSING' || r.status === 'READY') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateStatus.mutate(
                    { id: r.id, status: 'COMPLETED' },
                    { onSuccess: () => toast.success('已完成') },
                  )
                }
              >
                完成
              </Button>
            )}
            {r.status !== 'COMPLETED' && r.status !== 'CANCELED' && (
              <Button variant="danger" size="sm" onClick={() => setCancelTarget(r.id)}>
                取消
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="销售订单" />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="订单总数" value={String(data?.total ?? 0)} />
        <KpiCard label="当页收入" value={`¥${revenue.toFixed(2)}`} valueColor="accent" />
        <KpiCard
          label="均单价"
          value={list.length ? `¥${(revenue / list.length).toFixed(2)}` : '—'}
        />
        <KpiCard
          label="退款单"
          value={String(refunds)}
          valueColor={refunds > 0 ? 'danger' : 'text'}
        />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
          <Input
            className="pl-8 h-8 w-60 text-[12px]"
            placeholder="订单号 / 门店 / 客户手机"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => { setStatus(t.key); setPage(1); }}
              className={cn(
                'h-7 px-3 rounded-full text-[12px] font-medium transition-colors',
                status === t.key
                  ? 'bg-primary-50 text-primary'
                  : 'text-text-2 hover:bg-[#F1F3EE]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable<SalesOrder>
        columns={columns}
        data={list}
        loading={isLoading}
        pageSize={pageSize}
        searchPlaceholder="筛选当前结果"
        toolbar={
          <div className="flex items-center gap-1 text-[12px] text-text-3">
            <select
              className="h-7 rounded-[6px] border border-border bg-surface px-2 text-[12px] text-text-2 focus:outline-none"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/页</option>)}
            </select>
            <span>共 {data?.total ?? 0} 条</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="tabular-nums">{page} / {totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        }
      />

      {/* Cancel confirm dialog */}
      <Dialog open={cancelTarget !== null} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认取消订单？</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-2">此操作不可撤回，订单状态将变更为已取消。</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>返回</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (cancelTarget !== null) {
                  updateStatus.mutate(
                    { id: cancelTarget, status: 'CANCELED' },
                    { onSuccess: () => { toast.success('订单已取消'); setCancelTarget(null); } },
                  );
                }
              }}
            >
              确认取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
