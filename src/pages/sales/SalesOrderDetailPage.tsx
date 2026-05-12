import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2, Circle, Loader2 } from 'lucide-react';

import { useSalesOrder } from '@/hooks/useSalesOrders';
import { ORDER_STATUS_LABEL, PAY_METHOD_LABEL } from '@/types/order';
import type { OrderStatus } from '@/types/order';
import { PROCESS_METHOD_LABEL } from '@/types/poultry';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { StatusPill } from '@/components/data/StatusPill';
import type { StatusKey } from '@/components/data/StatusPill';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

type TimelineStep = {
  label: string;
  time?: string;
  done: boolean;
  active: boolean;
};

function buildTimeline(status: OrderStatus, createdAt: string, paidAt?: string, completedAt?: string): TimelineStep[] {
  const isAfter = (s: OrderStatus, target: OrderStatus) => {
    const order: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'READY', 'COMPLETED'];
    return order.indexOf(s) >= order.indexOf(target);
  };
  return [
    { label: '下单', time: createdAt, done: true, active: false },
    { label: '付款', time: paidAt, done: !!paidAt, active: status === 'PENDING' },
    { label: '加工中', time: undefined, done: isAfter(status, 'PROCESSING'), active: status === 'PROCESSING' },
    { label: '待提货', time: undefined, done: isAfter(status, 'READY'), active: status === 'READY' },
    { label: '取货完成', time: completedAt, done: status === 'COMPLETED', active: false },
  ];
}

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useSalesOrder(id ? +id : undefined);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-7 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="col-span-5 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const timeline = buildTimeline(data.status, data.createdAt, data.paidAt, data.completedAt);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`订单详情：${data.orderNo}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> 返回
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer size={14} /> 打印小票
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        {/* Left — timeline + items + totals */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* Order timeline */}
          <Card>
            <CardHeader>
              <CardTitle>加工进度</CardTitle>
              <StatusPill status={ORDER_STATUS_TO_PILL[data.status]} />
            </CardHeader>
            <CardBody>
              <ol className="relative ml-3">
                {timeline.map((step, i) => (
                  <li key={step.label} className={cn('relative pl-6 pb-6', i === timeline.length - 1 && 'pb-0')}>
                    {/* connector line */}
                    {i < timeline.length - 1 && (
                      <span className="absolute left-0 top-4 bottom-0 w-px bg-border" />
                    )}
                    {/* dot */}
                    <span className="absolute left-0 top-0.5 -translate-x-[calc(50%-1px)]">
                      {step.active ? (
                        <Loader2 size={16} className="text-accent animate-spin" />
                      ) : step.done ? (
                        <CheckCircle2 size={16} className="text-primary" />
                      ) : (
                        <Circle size={16} className="text-border" />
                      )}
                    </span>
                    <p className={cn('text-[13px] font-medium', !step.done && !step.active && 'text-text-3')}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-[12px] text-text-3 mt-0.5">{step.time}</p>
                    )}
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          {/* Items table */}
          <Card>
            <CardHeader>
              <CardTitle>商品明细</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-[#F7F8F5]">
                    {['品类', '只数', '净重(斤)', '单价', '加工方式', '加工费', '小计'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-text-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={item.id ?? i} className="border-b border-border last:border-0 hover:bg-primary-50/30 transition-colors">
                      <td className="px-4 py-3">{item.categoryName}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3 tabular-nums">{item.weight}</td>
                      <td className="px-4 py-3 tabular-nums">¥{item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {PROCESS_METHOD_LABEL[item.processMethod as keyof typeof PROCESS_METHOD_LABEL]}
                      </td>
                      <td className="px-4 py-3 tabular-nums">¥{item.processFee.toFixed(2)}</td>
                      <td className="px-4 py-3 tabular-nums font-medium text-danger">
                        ¥{item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F7F8F5]">
                    <td colSpan={6} className="px-4 py-3 text-right text-[12px] text-text-3 font-medium">
                      合计 / 优惠 / 应收：
                    </td>
                    <td className="px-4 py-3 text-[13px] tabular-nums">
                      ¥{data.totalAmount.toFixed(2)} / ¥{data.discount.toFixed(2)} /{' '}
                      <span className="text-[16px] font-bold text-danger">¥{data.payable.toFixed(2)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Right — info cards */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Order info */}
          <Card>
            <CardHeader><CardTitle>订单信息</CardTitle></CardHeader>
            <CardBody className="space-y-2.5">
              {[
                { label: '订单号', value: <span className="font-mono text-[12px]">{data.orderNo}</span> },
                { label: '门店', value: data.storeName },
                { label: '收银员', value: data.cashierName ?? '-' },
                { label: '下单时间', value: data.createdAt },
                { label: '备注', value: data.remark ?? '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-[12px] text-text-3 shrink-0 w-16">{label}</span>
                  <span className="text-[13px] text-right">{value}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Customer & payment */}
          <Card>
            <CardHeader><CardTitle>客户 &amp; 支付</CardTitle></CardHeader>
            <CardBody className="space-y-2.5">
              {[
                { label: '客户手机', value: data.customerPhone ?? '-' },
                { label: '支付方式', value: data.payMethod ? PAY_METHOD_LABEL[data.payMethod] : '-' },
                { label: '付款时间', value: data.paidAt ?? '-' },
                { label: '完成时间', value: data.completedAt ?? '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-[12px] text-text-3 shrink-0 w-16">{label}</span>
                  <span className="text-[13px] text-right">{value}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader><CardTitle>金额汇总</CardTitle></CardHeader>
            <CardBody className="space-y-2.5">
              {[
                { label: '商品合计', value: `¥${data.totalAmount.toFixed(2)}` },
                { label: '优惠', value: `-¥${data.discount.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[13px] text-text-2">{label}</span>
                  <span className="text-[13px] tabular-nums">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[14px] font-semibold text-text">应收</span>
                <span className="text-[22px] font-bold text-danger tabular-nums">
                  ¥{data.payable.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-3">订单状态</span>
                <StatusPill status={ORDER_STATUS_TO_PILL[data.status]} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-3">全称</span>
                <span className="text-[13px] text-text-2">{ORDER_STATUS_LABEL[data.status]}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
