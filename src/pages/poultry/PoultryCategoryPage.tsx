import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { usePoultry, usePoultryMutations } from '@/hooks/usePoultry';
import type { PoultryCategory, PriceUnit } from '@/types/poultry';

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

const SPECIES: PoultryCategory['species'][] = ['鸡', '鸭', '鹅', '鸽', '鹌鹑', '兔', '其他'];
const UNIT_LABEL: Record<PriceUnit, string> = { JIN: '元/斤', KG: '元/千克', PIECE: '元/只' };

type FormValues = {
  code: string;
  name: string;
  species: PoultryCategory['species'];
  unit: PriceUnit;
  basePrice: number;
  processingFee: number;
  avgWeight: number;
  description: string;
  enabled: boolean;
};

const defaultValues: FormValues = {
  code: '',
  name: '',
  species: '鸡',
  unit: 'JIN',
  basePrice: 0,
  processingFee: 0,
  avgWeight: 3,
  description: '',
  enabled: true,
};

export default function PoultryCategoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<PoultryCategory | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PoultryCategory | null>(null);

  const { data, isLoading } = usePoultry({ page, pageSize, keyword });
  const { create, update, remove } = usePoultryMutations();

  const form = useForm<FormValues>({ defaultValues });

  const openSheet = (row?: PoultryCategory) => {
    setEditing(row ?? null);
    form.reset(row ? { ...row, description: row.description ?? '' } : defaultValues);
    setSheetOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...values });
      toast.success('已更新');
    } else {
      await create.mutateAsync(values);
      toast.success('已新增');
    }
    setSheetOpen(false);
  });

  const list = data?.list ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const columns: ColumnDef<PoultryCategory>[] = [
    {
      header: '编码',
      accessorKey: 'code',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    { header: '名称', accessorKey: 'name' },
    {
      header: '品种',
      accessorKey: 'species',
      cell: ({ getValue }) => <Pill tone="mute">{getValue<string>()}</Pill>,
    },
    {
      header: '计价单位',
      accessorKey: 'unit',
      cell: ({ getValue }) => UNIT_LABEL[getValue<PriceUnit>()],
    },
    {
      header: '单价',
      accessorKey: 'basePrice',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">¥{Number(getValue<number>()).toFixed(2)}</span>
      ),
    },
    {
      header: '加工费',
      accessorKey: 'processingFee',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">
          ¥{Number(getValue<number>()).toFixed(2)}/只
        </span>
      ),
    },
    {
      header: '均重(斤)',
      accessorKey: 'avgWeight',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{Number(getValue<number>())}</span>
      ),
    },
    {
      header: '状态',
      accessorKey: 'enabled',
      cell: ({ getValue }) =>
        getValue<boolean>() ? <Pill tone="up">启用</Pill> : <Pill tone="mute">停用</Pill>,
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openSheet(row.original)}>
            <Pencil size={12} />
            编辑
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row.original)}>
            <Trash2 size={12} />
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="活禽品类"
        sub="管理系统内所有活禽品类、定价与规格"
        actions={
          <Button onClick={() => openSheet()}>
            <Plus size={14} />
            新增品类
          </Button>
        }
      />

      <DataTable<PoultryCategory>
        columns={columns}
        data={list}
        loading={isLoading}
        pageSize={pageSize}
        searchPlaceholder="筛选当前结果"
        toolbar={
          <div className="flex items-center gap-2 text-[12px] text-text-3">
            <Input
              className="h-8 w-48 text-[12px]"
              placeholder="服务端搜索：编码/名称/品种"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
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
            <SheetTitle>{editing ? '编辑品类' : '新增品类'}</SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-1">
              <FormField
                control={form.control}
                name="code"
                rules={{ required: '请输入编码' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>编码</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="如 P001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                rules={{ required: '请输入名称' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="如 三黄鸡" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>品种</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPECIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>计价单位</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="JIN">元/斤</SelectItem>
                        <SelectItem value="KG">元/千克</SelectItem>
                        <SelectItem value="PIECE">元/只</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basePrice"
                rules={{ required: '请输入单价' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>单价</FormLabel>
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
                name="processingFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>加工费 (元/只)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avgWeight"
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
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
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(v === 'true')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">启用</SelectItem>
                        <SelectItem value="false">停用</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <SheetFooter>
                <Button type="button" variant="ghost" onClick={() => setSheetOpen(false)}>
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  保存
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除该品类？</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-2">
            删除后不可恢复，相关历史数据可能受到影响。
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteTarget) {
                  await remove.mutateAsync(deleteTarget.id);
                  toast.success('已删除');
                  setDeleteTarget(null);
                }
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
