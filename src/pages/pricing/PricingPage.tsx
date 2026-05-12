import { useState } from 'react';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { usePricing, usePricingMutations } from '@/hooks/usePeople';
import type { PricingItem } from '@/types/people';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { toast } from '@/components/ui/toast';

export default function PricingPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = usePricing({ page, pageSize });
  const { update } = usePricingMutations();
  const [draft, setDraft] = useState<Record<number, Partial<PricingItem>>>({});

  const save = async (row: PricingItem) => {
    const patch = draft[row.id];
    if (!patch) return;
    await update.mutateAsync({ id: row.id, ...patch });
    toast.success(`${row.categoryName} 价格已更新`);
    setDraft((d) => { const next = { ...d }; delete next[row.id]; return next; });
  };

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const columns: ColumnDef<PricingItem>[] = [
    {
      header: '日期',
      accessorKey: 'date',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    { header: '品类', accessorKey: 'categoryName' },
    {
      header: '门店',
      accessorKey: 'storeName',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-text-3">{getValue<string | undefined>() ?? '-'}</span>
      ),
    },
    {
      header: '当日单价 (元)',
      accessorKey: 'price',
      cell: ({ row }) => (
        <Input
          type="number"
          min={0}
          step={0.1}
          defaultValue={row.original.price}
          className="h-7 w-28 text-[12px]"
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              [row.original.id]: { ...(d[row.original.id] ?? {}), price: Number(e.target.value) },
            }))
          }
        />
      ),
    },
    {
      header: '加工费 (元/只)',
      accessorKey: 'processingFee',
      cell: ({ row }) => (
        <Input
          type="number"
          min={0}
          step={0.1}
          defaultValue={row.original.processingFee}
          className="h-7 w-28 text-[12px]"
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              [row.original.id]: { ...(d[row.original.id] ?? {}), processingFee: Number(e.target.value) },
            }))
          }
        />
      ),
    },
    {
      header: '促销价',
      accessorKey: 'promotionPrice',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={0.1}
            defaultValue={row.original.promotionPrice ?? ''}
            placeholder="无"
            className="h-7 w-28 text-[12px]"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                [row.original.id]: {
                  ...(d[row.original.id] ?? {}),
                  promotionPrice: e.target.value ? Number(e.target.value) : undefined,
                },
              }))
            }
          />
          {row.original.promotionPrice != null && (
            <Pill tone="warn">促销</Pill>
          )}
        </div>
      ),
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!draft[row.original.id]}
          onClick={() => save(row.original)}
        >
          <Save size={12} />
          保存
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="价格管理"
        sub="每日单价 — 直接修改单元格后点击保存"
        actions={
          <Pill tone="warn">直接修改单元格后点击保存</Pill>
        }
      />

      <DataTable<PricingItem>
        columns={columns}
        data={data?.list ?? []}
        loading={isLoading}
        pageSize={pageSize}
        searchPlaceholder="筛选品类 / 日期"
        toolbar={
          <div className="flex items-center gap-1 text-[12px] text-text-3">
            <select
              className="h-7 rounded-[6px] border border-border bg-surface px-2 text-[12px] text-text-2 focus:outline-none"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/页</option>)}
            </select>
            <span>共 {total} 条</span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft size={14} />
            </Button>
            <span className="tabular-nums">{page} / {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        }
      />
    </div>
  );
}
