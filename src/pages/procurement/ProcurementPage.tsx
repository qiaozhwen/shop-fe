import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { usePurchases, usePurchaseMutations, useAllSuppliers } from '@/hooks/useBiz';
import { useAllStores } from '@/hooks/useStores';
import { useAllPoultry } from '@/hooks/usePoultry';
import type { PurchaseOrder, PurchaseStatus } from '@/types/biz';
import { PURCHASE_STATUS_LABEL } from '@/types/biz';

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

const STATUS_TONE: Record<PurchaseStatus, { tone: 'mute' | 'info' | 'up' | 'down'; label: string }> = {
  DRAFT: { tone: 'mute', label: PURCHASE_STATUS_LABEL.DRAFT },
  SUBMITTED: { tone: 'info', label: PURCHASE_STATUS_LABEL.SUBMITTED },
  RECEIVED: { tone: 'up', label: PURCHASE_STATUS_LABEL.RECEIVED },
  CANCELED: { tone: 'down', label: PURCHASE_STATUS_LABEL.CANCELED },
};

type FormValues = {
  supplierId: number;
  storeId: number;
  categoryId: number;
  quantity: number;
  totalWeight: number;
  unitPrice: number;
  batchNo: string;
  remark: string;
};

const defaultValues: FormValues = {
  supplierId: 0,
  storeId: 0,
  categoryId: 0,
  quantity: 1,
  totalWeight: 0,
  unitPrice: 0,
  batchNo: '',
  remark: '',
};

export default function ProcurementPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading } = usePurchases({ page, pageSize, keyword });
  const { create, receive } = usePurchaseMutations();
  const { data: suppliers } = useAllSuppliers();
  const { data: stores } = useAllStores();
  const { data: cats } = useAllPoultry();

  const form = useForm<FormValues>({ defaultValues });
  const list = data?.list ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const openCreate = () => {
    form.reset(defaultValues);
    setSheetOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const sup = suppliers?.find((s) => s.id === values.supplierId);
    const st = stores?.find((s) => s.id === values.storeId);
    const cat = cats?.find((c) => c.id === values.categoryId);
    await create.mutateAsync({
      supplierId: values.supplierId,
      supplierName: sup?.name ?? '',
      storeId: values.storeId,
      storeName: st?.name ?? '',
      categoryName: cat?.name ?? '',
      quantity: values.quantity,
      totalWeight: values.totalWeight,
      unitPrice: values.unitPrice,
      batchNo: values.batchNo,
      remark: values.remark,
    } as any);
    toast.success('已创建采购单');
    setSheetOpen(false);
    form.reset();
  });

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      header: '单号',
      accessorKey: 'orderNo',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    { header: '供应商', accessorKey: 'supplierName' },
    { header: '品类', accessorKey: 'categoryName' },
    {
      header: '只数',
      accessorKey: 'quantity',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{getValue<number>()}</span>
      ),
    },
    {
      header: '金额',
      accessorKey: 'amount',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-danger">
          ¥{Number(getValue<number>()).toFixed(2)}
        </span>
      ),
    },
    {
      header: '状态',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const cfg = STATUS_TONE[getValue<PurchaseStatus>()];
        return <Pill tone={cfg.tone}>{cfg.label}</Pill>;
      },
    },
    {
      header: '入库时间',
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
        if (r.status !== 'SUBMITTED') return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              receive.mutate(r.id, { onSuccess: () => toast.success('已确认入栏') })
            }
          >
            <Check size={12} />
            确认入栏
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="采购入库"
        sub="供应商采购单与入栏确认"
        actions={
          <Button onClick={openCreate}>
            <Plus size={14} />
            新增采购单
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <Input
          className="h-8 w-64 text-[12px]"
          placeholder="单号 / 供应商 / 品类"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable<PurchaseOrder>
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
            <SheetTitle>新增采购单</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-1">
              <FormField
                control={form.control}
                name="supplierId"
                rules={{ required: '请选择供应商', validate: (v) => v > 0 || '请选择供应商' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>供应商</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择供应商" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(suppliers ?? []).map((s) => (
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
                name="storeId"
                rules={{ required: '请选择门店', validate: (v) => v > 0 || '请选择门店' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入栏门店</FormLabel>
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
                name="quantity"
                rules={{ required: '请输入只数' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>只数</FormLabel>
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
                name="totalWeight"
                rules={{ required: '请输入总重' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>总重 (斤)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
                name="unitPrice"
                rules={{ required: '请输入单价' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>进货单价 (元/斤)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
                name="batchNo"
                rules={{ required: '请输入批次号' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>批次号</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="如 B20260508-01" />
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
