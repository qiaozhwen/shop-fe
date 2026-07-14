import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Plus, ChevronRight, Package,
  ShoppingCart, Wrench, AlertTriangle,
} from 'lucide-react';

import { useDashboard } from '@/hooks/usePeople';
import { useInventory } from '@/hooks/useInventory';
import { useProcessingTasks } from '@/hooks/useProcessing';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardSub, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/data/KpiCard';
import { StatusPill } from '@/components/data/StatusPill';
import { InventoryBar } from '@/components/data/InventoryBar';
import { LineChart } from '@/components/chart/LineChart';
import type { StatusKey } from '@/components/data/StatusPill';
import type { ProcessingStatus } from '@/types/processing';

/* ── status mapping ─────────────────────────────────────────── */
const PROCESSING_STATUS_MAP: Record<ProcessingStatus, StatusKey> = {
  WAIT_SLAUGHTER: 'pending',
  SLAUGHTERING: 'processing',
  PLUCKING: 'processing',
  EVISCERATING: 'processing',
  PACKING: 'ready',
  DELIVERED: 'completed',
  CANCELED: 'cancelled',
};

const INV_CAPACITY_DEFAULT = 100;

/* ── component ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  const { data: processingRes } = useProcessingTasks({ pageSize: 5, active: true });
  const { data: inventoryRes } = useInventory({ pageSize: 6 });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const trendData = data.salesTrend.map((s) => ({ ...s, date: s.date.slice(5) }));
  const trendValues = data.salesTrend.map((s) => s.sales);
  const orderValues = data.salesTrend.map((s) => s.orders);

  const queueTasks = processingRes?.list ?? [];
  const invItems = inventoryRes?.list ?? [];
  const lowStockCount = data.lowStockCount;
  const todos = [
    ...(lowStockCount > 0 ? [{
      color: 'var(--danger)',
      icon: <AlertTriangle size={14} />,
      title: `库存预警：${lowStockCount} 类库存需补货`,
      meta: '建议及时补货 · 实时',
      action: () => navigate('/inventory'),
    }] : []),
    ...(data.processingPending > 0 ? [{
      color: 'var(--accent)',
      icon: <Wrench size={14} />,
      title: `${data.processingPending} 个加工任务进行中`,
      meta: '请关注档口状态 · 实时',
      action: () => navigate('/sales/processing'),
    }] : []),
    ...(data.todayOrders > 0 ? [{
      color: 'var(--primary)',
      icon: <ShoppingCart size={14} />,
      title: `今日已售 ${data.todayOrders} 单`,
      meta: `进账 ¥${data.todaySales.toFixed(2)} · 实时`,
      action: () => navigate('/sales/orders'),
    }] : []),
  ];

  const dateStr = dayjs().format('YYYY-MM-DD ddd · 数据每 30 秒更新');

  return (
    <div className="flex flex-col gap-4">
      {/* ── Page Header ─────────────────────────────────────── */}
      <PageHeader
        title="今日工作台"
        sub={dateStr}
        actions={
          <Button variant="primary" size="md" onClick={() => navigate('/pos')}>
            <Plus size={14} />
            快速开单
          </Button>
        }
      />

      {/* ── KPI grid (4-col) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          label="今日营业额"
          value={`¥${data.todaySales.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          meta={[
            { tone: 'mute', text: '已支付订单' },
          ]}
          trend={trendValues}
        />
        <KpiCard
          label="订单数"
          value={String(data.todayOrders)}
          meta={[
            {
              tone: 'mute',
              text: `客单价 ¥${data.todayOrders > 0 ? (data.todaySales / data.todayOrders).toFixed(1) : '0'}`,
            },
          ]}
          trend={orderValues}
        />
        <KpiCard
          label="在加工"
          value={String(data.processingPending)}
          valueColor="accent"
          meta={[
            { tone: data.processingPending > 0 ? 'warn' : 'mute', text: '进行中任务' },
          ]}
        />
        <KpiCard
          label="库存预警"
          value={String(lowStockCount)}
          valueColor="danger"
          meta={[
            { tone: 'down', text: '需补货' },
            { tone: 'mute', text: `损耗 ${data.todayLoss} 只` },
          ]}
        />
      </div>

      {/* ── 2:1 row — chart + live queue ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5">
        {/* Sales trend chart */}
        <Card>
          <CardHeader>
            <CardTitle>营业趋势</CardTitle>
            <CardSub>近 7 日</CardSub>
          </CardHeader>
          <CardBody className="pt-2">
            <LineChart
              data={trendData}
              xKey="date"
              lines={[
                { key: 'orders', color: 'var(--primary)', name: '订单量' },
                { key: 'sales', color: '#B6C2BB', name: '营业额' },
              ]}
              height={200}
            />
            <div className="flex gap-4 text-[12px] text-text-2 pt-2.5 border-t border-border mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-primary rounded inline-block" />订单量
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#B6C2BB] rounded inline-block border-b border-dashed" />营业额
              </span>
              <span className="ml-auto text-text-3">最高 {Math.max(...orderValues, 0)} 单</span>
            </div>
          </CardBody>
        </Card>

        {/* Live processing queue */}
        <Card>
          <CardHeader>
            <CardTitle>加工档口实时</CardTitle>
            <CardSub>{data.processingPending} 进行中</CardSub>
          </CardHeader>
          <div className="divide-y divide-border">
            {queueTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="font-mono text-[12px] text-text-3 w-14 shrink-0">
                    #{task.taskNo.slice(-5)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-text truncate">
                      {task.categoryName} · {task.weight}斤
                    </div>
                    <div className="text-[11.5px] text-text-3 mt-0.5">
                      {task.workerName ?? '待分配'} · {dayjs(task.createdAt).format('HH:mm')}
                    </div>
                  </div>
                  <StatusPill
                    status={PROCESSING_STATUS_MAP[task.status]}
                    pulse={!['DELIVERED', 'CANCELED'].includes(task.status)}
                  />
                </div>
            ))}
            {queueTasks.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-text-3">暂无加工任务</div>
            )}
          </div>
        </Card>
      </div>

      {/* ── 3-col grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Inventory health */}
        <Card>
          <CardHeader>
            <CardTitle>活禽存栏</CardTitle>
            <CardSub>实时</CardSub>
          </CardHeader>
          <div className="divide-y divide-border">
            {invItems.slice(0, 6).map((item) => ({
                  id: item.id,
                  categoryName: item.categoryName,
                  quantity: item.quantity,
                  capacity: INV_CAPACITY_DEFAULT,
                })).map((row) => (
              <div key={row.id} className="flex items-center gap-3.5 px-5 py-3">
                <div className="w-9 h-9 rounded-[8px] bg-primary-50 text-primary flex items-center justify-center shrink-0">
                  <Package size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text">{row.categoryName}</div>
                  <div className="mt-1.5">
                    <InventoryBar value={row.quantity} total={row.capacity} />
                  </div>
                </div>
                <div
                  className={`font-mono text-[13px] font-semibold whitespace-nowrap ${
                    row.quantity / row.capacity < 0.2 ? 'text-danger' : 'text-text'
                  }`}
                >
                  {row.quantity}
                  <small className="text-text-3 font-normal ml-0.5">/ {row.capacity}</small>
                </div>
              </div>
            ))}
            {invItems.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-text-3">暂无库存数据</div>
            )}
          </div>
        </Card>

        {/* Category ranking */}
        <Card>
          <CardHeader>
            <CardTitle>销售排行 TOP 5</CardTitle>
            <CardSub>今日</CardSub>
          </CardHeader>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-semibold text-text-3 uppercase tracking-[.5px] px-5 py-2.5 bg-[#FAFBF7] border-b border-border">
                  品类
                </th>
                <th className="text-right text-[11px] font-semibold text-text-3 uppercase tracking-[.5px] px-5 py-2.5 bg-[#FAFBF7] border-b border-border">
                  营收
                </th>
              </tr>
            </thead>
            <tbody>
              {data.categoryRanking.slice(0, 5).map((c, i) => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-[13px] text-text">
                    <span
                      className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] text-[11px] font-bold mr-2 ${
                        i < 2 ? 'bg-[#FEF3E2] text-accent' : 'bg-[#F1F3EE] text-text-2'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {c.name}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[13px] text-text">
                    ¥{c.sales.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Todo list */}
        <Card>
          <CardHeader>
            <CardTitle>待办事项</CardTitle>
            <CardSub>{todos.length} 项</CardSub>
          </CardHeader>
          <div className="divide-y divide-border">
            {todos.map((todo) => (
              <div
                key={todo.title}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#F7F8F5] transition-colors"
                onClick={todo.action}
              >
                <div
                  className="w-1.5 h-9 rounded-[3px] shrink-0"
                  style={{ background: todo.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text truncate">{todo.title}</div>
                  <div className="text-[11.5px] text-text-3 mt-0.5">{todo.meta}</div>
                </div>
                <ChevronRight size={14} className="text-text-3 shrink-0" />
              </div>
            ))}
            {todos.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-text-3">暂无待办事项</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
