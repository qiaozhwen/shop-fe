import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { ColumnDef } from '@tanstack/react-table';

import { useDashboard } from '@/hooks/usePeople';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { useInventory } from '@/hooks/useInventory';
import { useLosses } from '@/hooks/useBiz';
import { LOSS_REASON_LABEL } from '@/types/biz';
import type { SalesOrder, OrderStatus } from '@/types/order';
import type { InventoryItem } from '@/types/inventory';
import type { LossRecord, LossReason } from '@/types/biz';

import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/data/KpiCard';
import { DataTable } from '@/components/data/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';

/* ─── order status pill config ─── */
const ORDER_PILL: Record<OrderStatus, { tone: 'up' | 'down' | 'warn' | 'info' | 'mute'; label: string }> = {
  PENDING:    { tone: 'mute', label: '待付款' },
  PAID:       { tone: 'info', label: '待加工' },
  PROCESSING: { tone: 'warn', label: '加工中' },
  READY:      { tone: 'info', label: '待提货' },
  COMPLETED:  { tone: 'up',   label: '已完成' },
  CANCELED:   { tone: 'down', label: '已取消' },
  REFUNDED:   { tone: 'down', label: '已退款' },
};

/* ─── column definitions ─── */
const salesCols: ColumnDef<SalesOrder, unknown>[] = [
  { header: '订单号', accessorKey: 'orderNo' },
  { header: '门店',   accessorKey: 'storeName' },
  {
    header: '应收',
    accessorKey: 'payable',
    cell: ({ getValue }) => `¥${(getValue() as number).toFixed(2)}`,
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ getValue }) => {
      const s = getValue() as OrderStatus;
      const cfg = ORDER_PILL[s];
      return <Pill tone={cfg.tone}>{cfg.label}</Pill>;
    },
  },
  { header: '时间', accessorKey: 'createdAt' },
];

const invCols: ColumnDef<InventoryItem, unknown>[] = [
  { header: '门店',     accessorKey: 'storeName' },
  { header: '品类',     accessorKey: 'categoryName' },
  { header: '批次',     accessorKey: 'batchNo' },
  { header: '只数',     accessorKey: 'quantity' },
  { header: '总重(斤)', accessorKey: 'totalWeight' },
];

const lossCols: ColumnDef<LossRecord, unknown>[] = [
  { header: '门店',   accessorKey: 'storeName' },
  { header: '品类',   accessorKey: 'categoryName' },
  { header: '只数',   accessorKey: 'quantity' },
  {
    header: '原因',
    accessorKey: 'reason',
    cell: ({ getValue }) => LOSS_REASON_LABEL[getValue() as LossReason] ?? String(getValue()),
  },
  { header: '处理方式', accessorKey: 'disposeMethod' },
  { header: '处理人',   accessorKey: 'handler' },
  { header: '时间',     accessorKey: 'occurredAt' },
];

/* ─── chart tooltip style ─── */
const tooltipStyle = { fontSize: 12, borderColor: 'var(--border)', borderRadius: 8 };
const axisStyle    = { fontSize: 11, fill: 'var(--text-3)' };

export default function ReportPage() {
  const [tab, setTab] = useState('sales');

  const { data: ds }     = useDashboard();
  const { data: orders } = useSalesOrders({ pageSize: 100 });
  const { data: inv }    = useInventory({ pageSize: 100 });
  const { data: losses } = useLosses({ pageSize: 100 });

  /* ── sales KPIs ── */
  const totalSales     = orders?.list.reduce((s, o) => s + o.payable, 0) ?? 0;
  const orderCount     = orders?.total ?? 0;
  const avgTicket      = orderCount > 0 ? totalSales / orderCount : 0;
  const completedCount = orders?.list.filter((o) => o.status === 'COMPLETED').length ?? 0;
  const completionRate = orderCount > 0 ? Math.round((completedCount / orderCount) * 100) : 0;

  /* ── inventory KPIs ── */
  const totalStock    = inv?.list.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const healthyStock  = inv?.list.filter((i) => i.health === 'HEALTHY').reduce((s, i) => s + i.quantity, 0) ?? 0;
  const lowStockCount = inv?.list.filter((i) => i.quantity < 10).length ?? 0;

  /* ── loss KPIs ── */
  const totalLoss = losses?.list.reduce((s, l) => s + l.quantity, 0) ?? 0;
  const lossRate  = totalStock + totalLoss > 0
    ? ((totalLoss / (totalStock + totalLoss)) * 100).toFixed(1)
    : '0.0';

  /* ── chart data ── */
  const lossByReason = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of losses?.list ?? []) {
      const label = LOSS_REASON_LABEL[l.reason as LossReason] ?? l.reason;
      map[label] = (map[label] ?? 0) + l.quantity;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [losses]);

  const stockByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of inv?.list ?? []) {
      map[i.categoryName] = (map[i.categoryName] ?? 0) + i.quantity;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [inv]);

  /* ── export ── */
  const handleExport = () => {
    const rows = orders?.list.map(
      (o) => `${o.orderNo},${o.storeName},${o.payable},${ORDER_PILL[o.status]?.label ?? o.status}`
    ) ?? [];
    const csv  = ['订单号,门店,应收,状态', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="经营报表"
        actions={
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download size={14} />
            导出
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sales">销售</TabsTrigger>
          <TabsTrigger value="inv">库存</TabsTrigger>
          <TabsTrigger value="loss">损耗</TabsTrigger>
        </TabsList>

        {/* ─── 销售 ─── */}
        <TabsContent value="sales">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="销售额"
                value={`¥${totalSales.toFixed(2)}`}
                valueColor="accent"
                trend={ds?.salesTrend?.map((t) => t.sales)}
              />
              <KpiCard
                label="订单数"
                value={String(orderCount)}
                trend={ds?.salesTrend?.map((t) => t.orders)}
              />
              <KpiCard label="客单价" value={`¥${avgTicket.toFixed(2)}`} />
              <KpiCard
                label="完成率"
                value={`${completionRate}%`}
                meta={[{ tone: completionRate >= 80 ? 'up' : 'warn', text: completionRate >= 80 ? '达标' : '偏低' }]}
              />
            </div>

            {(ds?.salesTrend?.length ?? 0) > 0 && (
              <Card className="p-5">
                <div className="text-[13px] font-semibold text-text mb-4">销售趋势</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RLineChart data={ds!.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      name="销售额"
                    />
                  </RLineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {(ds?.categoryRanking?.length ?? 0) > 0 && (
              <Card className="p-5">
                <div className="text-[13px] font-semibold text-text mb-4">品类销售排行</div>
                <ResponsiveContainer width="100%" height={200}>
                  <RBarChart data={ds!.categoryRanking} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={axisStyle} />
                    <YAxis dataKey="name" type="category" width={80} tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="sales" fill="var(--primary)" radius={4} name="销售额" />
                  </RBarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <DataTable
              columns={salesCols}
              data={orders?.list ?? []}
              searchPlaceholder="搜索订单"
            />
          </div>
        </TabsContent>

        {/* ─── 库存 ─── */}
        <TabsContent value="inv">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <KpiCard label="库存总量(只)" value={String(totalStock)} />
              <KpiCard
                label="健康禽(只)"
                value={String(healthyStock)}
                meta={[{ tone: 'up', text: '健康' }]}
              />
              <KpiCard
                label="低库存批次"
                value={String(lowStockCount)}
                meta={[lowStockCount > 0 ? { tone: 'warn', text: '需补货' } : { tone: 'up', text: '充足' }]}
              />
            </div>

            {stockByCategory.length > 0 && (
              <Card className="p-5">
                <div className="text-[13px] font-semibold text-text mb-4">品类库存分布</div>
                <ResponsiveContainer width="100%" height={200}>
                  <RBarChart data={stockByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--primary)" radius={4} name="只数" />
                  </RBarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <DataTable
              columns={invCols}
              data={inv?.list ?? []}
              searchPlaceholder="搜索库存"
            />
          </div>
        </TabsContent>

        {/* ─── 损耗 ─── */}
        <TabsContent value="loss">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <KpiCard
                label="损耗总量(只)"
                value={String(totalLoss)}
                valueColor="danger"
                meta={[{ tone: 'down', text: `损耗率 ${lossRate}%` }]}
              />
              <KpiCard label="损耗批次" value={String(losses?.list.length ?? 0)} />
              <KpiCard
                label="损耗率"
                value={`${lossRate}%`}
                meta={[{ tone: parseFloat(lossRate) > 5 ? 'down' : 'up', text: parseFloat(lossRate) > 5 ? '偏高' : '正常' }]}
              />
            </div>

            {lossByReason.length > 0 && (
              <Card className="p-5">
                <div className="text-[13px] font-semibold text-text mb-4">损耗原因分布</div>
                <ResponsiveContainer width="100%" height={200}>
                  <RBarChart data={lossByReason}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--danger)" radius={4} name="只数" />
                  </RBarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <DataTable
              columns={lossCols}
              data={losses?.list ?? []}
              searchPlaceholder="搜索损耗"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
