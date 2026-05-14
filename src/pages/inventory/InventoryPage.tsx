import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useInventory, useInventoryMutations } from '@/hooks/useInventory';
import { useAllStores } from '@/hooks/useStores';
import { useAllPoultry } from '@/hooks/usePoultry';
import type { HealthStatus, InventoryItem } from '@/types/inventory';

import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/data/KpiCard';
import { DataTable } from '@/components/data/DataTable';
import { InventoryBar } from '@/components/data/InventoryBar';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

const HEALTH_TONE: Record<HealthStatus, { tone: 'up' | 'warn' | 'down'; label: string }> = {
  HEALTHY: { tone: 'up', label: '健康' },
  OBSERVED: { tone: 'warn', label: '观察' },
  SICK: { tone: 'down', label: '患病' },
  QUARANTINE: { tone: 'down', label: '隔离' },
};

function healthScore(row: InventoryItem) {
  switch (row.health) {
    case 'HEALTHY':
      return row.quantity;
    case 'OBSERVED':
      return Math.round(row.quantity * 0.7);
    case 'SICK':
      return Math.round(row.quantity * 0.3);
    case 'QUARANTINE':
    default:
      return 0;
  }
}

type CreateValues = {
  storeId: number;
  categoryId: number;
  batchNo: string;
  quantity: number;
  avgWeight: number;
  health: HealthStatus;
  inStockAt: string;
  supplierName: string;
  remark: string;
};

const createDefaults: CreateValues = {
  storeId: 0,
  categoryId: 0,
  batchNo: '',
  quantity: 50,
  avgWeight: 3,
  health: 'HEALTHY',
  inStockAt: new Date().toISOString().slice(0, 16),
  supplierName: '',
  remark: '',
};

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [storeId, setStoreId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [adjustOpen, setAdjustOpen] = useState<{ id: number } | null>(null);
  const [clearTarget, setClearTarget] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading } = useInventory({ page, pageSize, keyword, storeId, categoryId });
  const { create, adjust, remove } = useInventoryMutations();
  const { data: stores } = useAllStores();
  const { data: cats } = useAllPoultry();

  const list = data?.list ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = list.filter((i) => i.inStockAt?.startsWith(today)).length;
  const warningCount = list.filter((i) => i.health === 'SICK' || i.health === 'QUARANTINE').length;

  const createForm = useForm<CreateValues>({ defaultValues: createDefaults });
  const adjustForm = useForm<{ delta: number; reason: string }>({
    defaultValues: { delta: 0, reason: '' },
  });

  const openCreate = () => {
    createForm.reset({
      ...createDefaults,
      inStockAt: new Date().toISOString().slice(0, 16),
    });
    setSheetOpen(true);
  };

  const onCreate = createForm.handleSubmit(async (values) => {
    await create.mutateAsync({
      ...values,
      inStockAt: values.inStockAt.replace('T', ' ') + ':00',
      storeName: stores?.find((s) => s.id === values.storeId)?.name ?? '',
      categoryName: cats?.find((c) => c.id === values.categoryId)?.name ?? '',
    } as any);
    toast.success('已入栏');
    setSheetOpen(false);
  });

  const onAdjust = adjustForm.handleSubmit(async (values) => {
    if (!adjustOpen) return;
    await adjust.mutateAsync({ id: adjustOpen.id, delta: values.delta, reason: values.reason });
    toast.success('已调整');
    setAdjustOpen(null);
  });

  const columns: ColumnDef<InventoryItem>[] = [
    { header: '门店', accessorKey: 'storeName' },
    { header: '品类', accessorKey: 'categoryName' },
    {
      header: '批次号',
      accessorKey: 'batchNo',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    {
      header: '只数',
      accessorKey: 'quantity',
      cell: ({ getValue }) => (
        <span className="font-mono font-bold tabular-nums">{getValue<number>()}</span>
      ),
    },
    {
      header: '健康度',
      id: 'healthBar',
      cell: ({ row }) => (
        <div className="w-32">
          <InventoryBar value={healthScore(row.original)} total={row.original.quantity} />
        </div>
      ),
    },
    {
      header: '健康状态',
      accessorKey: 'health',
      cell: ({ getValue }) => {
        const cfg = HEALTH_TONE[getValue<HealthStatus>()];
        return <Pill tone={cfg.tone}>{cfg.label}</Pill>;
      },
    },
    {
      header: '入栏时间',
      accessorKey: 'inStockAt',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-text-3">{getValue<string>()}</span>
      ),
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              adjustForm.reset({ delta: 0, reason: '' });
              setAdjustOpen({ id: row.original.id });
            }}
          >
            调整
          </Button>
          <Button variant="danger" size="sm" onClick={() => setClearTarget(row.original.id)}>
            清栏
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="活禽存栏"
        sub="批次入栏与库存健康管理"
        actions={
          <Button onClick={openCreate}>
            <Plus size={14} />
            新增入栏
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="在栏批次" value={String(total)} />
        <KpiCard label="今日入库" value={String(todayCount)} valueColor="accent" />
        <KpiCard
          label="健康预警"
          value={String(warningCount)}
          valueColor={warningCount > 0 ? 'danger' : 'text'}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={storeId !== undefined ? String(storeId) : 'all'}
          onValueChange={(v) => {
            setStoreId(v === 'all' ? undefined : Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-40 text-[12px]">
            <SelectValue placeholder="门店" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部门店</SelectItem>
            {(stores ?? []).map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryId !== undefined ? String(categoryId) : 'all'}
          onValueChange={(v) => {
            setCategoryId(v === 'all' ? undefined : Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-40 text-[12px]">
            <SelectValue placeholder="品类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部品类</SelectItem>
            {(cats ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="h-8 w-56 text-[12px]"
          placeholder="批次号 / 品类"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable<InventoryItem>
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

      {/* Create sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>新增入栏</SheetTitle>
          </SheetHeader>
          <Form {...createForm}>
            <form onSubmit={onCreate} className="space-y-1">
              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
                name="avgWeight"
                rules={{ required: '请输入平均重量' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>平均重量 (斤)</FormLabel>
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
                control={createForm.control}
                name="health"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>健康状态</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEALTHY">健康</SelectItem>
                        <SelectItem value="OBSERVED">观察</SelectItem>
                        <SelectItem value="SICK">患病</SelectItem>
                        <SelectItem value="QUARANTINE">隔离</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="inStockAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入栏时间</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>供应商</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
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

      {/* Adjust sheet */}
      <Sheet
        open={adjustOpen !== null}
        onOpenChange={(open) => {
          if (!open) setAdjustOpen(null);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>库存调整</SheetTitle>
          </SheetHeader>
          <Form {...adjustForm}>
            <form onSubmit={onAdjust} className="space-y-1">
              <FormField
                control={adjustForm.control}
                name="delta"
                rules={{ required: '请输入变动只数' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>变动只数 (正为入栏，负为出栏)</FormLabel>
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
                control={adjustForm.control}
                name="reason"
                rules={{ required: '请填写原因' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>原因</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="如：补货 / 调拨 / 损耗" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="button" variant="ghost" onClick={() => setAdjustOpen(null)}>
                  取消
                </Button>
                <Button type="submit" disabled={adjust.isPending}>
                  保存
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Clear confirm dialog */}
      <Dialog
        open={clearTarget !== null}
        onOpenChange={(open) => {
          if (!open) setClearTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认清栏？</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-2">该批次将从库存中移除，操作不可撤回。</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setClearTarget(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (clearTarget !== null) {
                  await remove.mutateAsync(clearTarget);
                  toast.success('已清栏');
                  setClearTarget(null);
                }
              }}
            >
              确认清栏
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
