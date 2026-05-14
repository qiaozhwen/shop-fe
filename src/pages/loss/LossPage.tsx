import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useLosses, useLossMutations } from '@/hooks/useBiz';
import { useAllStores } from '@/hooks/useStores';
import { useAllPoultry } from '@/hooks/usePoultry';
import type { LossReason, LossRecord } from '@/types/biz';
import { LOSS_REASON_LABEL } from '@/types/biz';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/pill';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

const REASON_TONE: Record<LossReason, { tone: 'down' | 'warn' | 'mute'; label: string }> = {
  DEAD: { tone: 'down', label: LOSS_REASON_LABEL.DEAD },
  SICK: { tone: 'warn', label: LOSS_REASON_LABEL.SICK },
  INJURY: { tone: 'warn', label: LOSS_REASON_LABEL.INJURY },
  ESCAPED: { tone: 'mute', label: LOSS_REASON_LABEL.ESCAPED },
  OTHER: { tone: 'mute', label: LOSS_REASON_LABEL.OTHER },
};

const DISPOSE_OPTIONS = ['无害化处理', '焚烧', '深埋', '隔离观察'];

type FormValues = {
  storeId: number;
  categoryId: number;
  batchNo: string;
  quantity: number;
  reason: LossReason;
  handler: string;
  disposeMethod: string;
  occurredAt: string;
  remark: string;
};

const defaultValues: FormValues = {
  storeId: 0,
  categoryId: 0,
  batchNo: '',
  quantity: 1,
  reason: 'DEAD',
  handler: '',
  disposeMethod: '无害化处理',
  occurredAt: new Date().toISOString().slice(0, 16),
  remark: '',
};

export default function LossPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reasonFilter, setReasonFilter] = useState<LossReason | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading } = useLosses({ page, pageSize, keyword });
  const { create } = useLossMutations();
  const { data: stores } = useAllStores();
  const { data: cats } = useAllPoultry();

  const form = useForm<FormValues>({ defaultValues });

  const filtered = reasonFilter
    ? (data?.list ?? []).filter((r) => r.reason === reasonFilter)
    : (data?.list ?? []);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const openCreate = () => {
    form.reset({ ...defaultValues, occurredAt: new Date().toISOString().slice(0, 16) });
    setSheetOpen(true);
  };

  const onSubmit = form.handleSubmit(async () => {
    const v = form.getValues();
    const st = stores?.find((s) => s.id === v.storeId);
    const cat = cats?.find((c) => c.id === v.categoryId);
    await create.mutateAsync({
      ...v,
      storeName: st?.name ?? '',
      categoryName: cat?.name ?? '',
      occurredAt: v.occurredAt.replace('T', ' ') + ':00',
    });
    toast.success('已记录');
    setSheetOpen(false);
    form.reset();
  });

  const columns: ColumnDef<LossRecord>[] = [
    { header: '门店', accessorKey: 'storeName' },
    { header: '品类', accessorKey: 'categoryName' },
    {
      header: '批次',
      accessorKey: 'batchNo',
      cell: ({ getValue }) => getValue<string | undefined>() ?? '-',
    },
    {
      header: '只数',
      accessorKey: 'quantity',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{getValue<number>()}</span>
      ),
    },
    {
      header: '原因',
      accessorKey: 'reason',
      cell: ({ getValue }) => {
        const cfg = REASON_TONE[getValue<LossReason>()];
        return <Pill tone={cfg.tone}>{cfg.label}</Pill>;
      },
    },
    { header: '处理人', accessorKey: 'handler' },
    { header: '处理方式', accessorKey: 'disposeMethod' },
    {
      header: '发生时间',
      accessorKey: 'occurredAt',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-text-3">{getValue<string>()}</span>
      ),
    },
  ];

  const reasonKeys = Object.keys(LOSS_REASON_LABEL) as LossReason[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="损耗记录"
        sub="活禽损耗原因统计与记录"
        actions={
          <Button onClick={openCreate}>
            <Plus size={14} />
            新增损耗
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            key="all"
            onClick={() => setReasonFilter(undefined)}
            className={cn(
              'h-7 px-3 rounded-full text-[12px] font-medium transition-colors',
              reasonFilter === undefined
                ? 'bg-primary-50 text-primary'
                : 'text-text-2 hover:bg-[#F1F3EE]',
            )}
          >
            全部
          </button>
          {reasonKeys.map((key) => (
            <button
              key={key}
              onClick={() => setReasonFilter(key)}
              className={cn(
                'h-7 px-3 rounded-full text-[12px] font-medium transition-colors',
                reasonFilter === key
                  ? 'bg-primary-50 text-primary'
                  : 'text-text-2 hover:bg-[#F1F3EE]',
              )}
            >
              {LOSS_REASON_LABEL[key]}
            </button>
          ))}
        </div>
        <Input
          className="h-8 w-56 text-[12px]"
          placeholder="门店 / 品类 / 处理人"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable<LossRecord>
        columns={columns}
        data={filtered}
        loading={isLoading}
        pageSize={pageSize}
        searchPlaceholder="筛选当前结果"
        toolbar={
          <div className="flex items-center gap-1 text-[12px] text-text-3">
            <select
              className="h-7 rounded-[6px] border border-border bg-surface px-2 text-[12px] text-text-2 focus:outline-none"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/页
                </option>
              ))}
            </select>
            <span>共 {total} 条</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>新增损耗记录</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-1">
              <FormField
                control={form.control}
                name="storeId"
                rules={{ required: '请选择门店', validate: (v) => v > 0 || '请选择门店' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>门店</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择门店" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(stores ?? []).map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                rules={{ required: '请选择品类', validate: (v) => v > 0 || '请选择品类' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>品类</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择品类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(cats ?? []).map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="batchNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>批次号</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                rules={{ required: '请输入只数' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>损耗只数</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                rules={{ required: '请选择原因' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>原因</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reasonKeys.map((k) => (
                          <SelectItem key={k} value={k}>
                            {LOSS_REASON_LABEL[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="handler"
                rules={{ required: '请输入处理人' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>处理人</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disposeMethod"
                rules={{ required: '请选择处理方式' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>处理方式</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISPOSE_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occurredAt"
                rules={{ required: '请选择时间' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发生时间</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={2}
                        className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-[13px] text-text placeholder:text-text-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="button" variant="ghost" onClick={() => setSheetOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  保存
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
