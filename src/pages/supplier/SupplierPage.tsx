import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useSuppliers, useSupplierMutations } from '@/hooks/useBiz';
import type { Supplier } from '@/types/biz';

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

const LEVEL_TONE: Record<Supplier['level'], { tone: 'warn' | 'info' | 'mute'; label: string }> = {
  A: { tone: 'warn', label: 'A级' },
  B: { tone: 'info', label: 'B级' },
  C: { tone: 'mute', label: 'C级' },
};

type FormValues = {
  name: string;
  contact: string;
  phone: string;
  address: string;
  category: string;
  level: Supplier['level'];
  enabled: boolean;
  remark: string;
};

const defaultValues: FormValues = {
  name: '',
  contact: '',
  phone: '',
  address: '',
  category: '',
  level: 'A',
  enabled: true,
  remark: '',
};

export default function SupplierPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const { data, isLoading } = useSuppliers({ page, pageSize, keyword });
  const { create, update, remove } = useSupplierMutations();

  const form = useForm<FormValues>({ defaultValues });
  const list = data?.list ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const openSheet = (row?: Supplier) => {
    setEditing(row ?? null);
    form.reset(
      row
        ? {
            name: row.name,
            contact: row.contact,
            phone: row.phone,
            address: row.address ?? '',
            category: row.category ?? '',
            level: row.level ?? 'C',
            enabled: row.enabled !== false,
            remark: row.remark ?? '',
          }
        : defaultValues,
    );
    setSheetOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...values });
    } else {
      await create.mutateAsync(values);
    }
    toast.success('已保存');
    setSheetOpen(false);
  });

  const columns: ColumnDef<Supplier>[] = [
    { header: '名称', accessorKey: 'name' },
    { header: '联系人', accessorKey: 'contact' },
    {
      header: '电话',
      accessorKey: 'phone',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    {
      header: '主营品类',
      accessorKey: 'category',
      cell: ({ getValue }) => <Pill tone="info">{getValue<string>() || '-'}</Pill>,
    },
    {
      header: '等级',
      accessorKey: 'level',
      cell: ({ getValue }) => {
        const cfg = LEVEL_TONE[getValue<Supplier['level']>()] ?? LEVEL_TONE.C;
        return <Pill tone={cfg.tone}>{cfg.label}</Pill>;
      },
    },
    {
      header: '状态',
      accessorKey: 'enabled',
      cell: ({ getValue }) =>
        getValue<boolean>() !== false ? <Pill tone="up">启用</Pill> : <Pill tone="mute">停用</Pill>,
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
        title="供应商管理"
        sub="供应链合作伙伴档案"
        actions={
          <Button onClick={() => openSheet()}>
            <Plus size={14} />
            新增供应商
          </Button>
        }
      />

      <DataTable<Supplier>
        columns={columns}
        data={list}
        loading={isLoading}
        pageSize={pageSize}
        searchPlaceholder="筛选当前结果"
        toolbar={
          <div className="flex items-center gap-2 text-[12px] text-text-3">
            <Input
              className="h-8 w-56 text-[12px]"
              placeholder="名称 / 联系人 / 电话"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
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
            <SheetTitle>{editing ? '编辑供应商' : '新增供应商'}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-1">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: '请输入名称' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                rules={{ required: '请输入联系人' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>联系人</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                rules={{ required: '请输入电话' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电话</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地址</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>主营品类</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="如：鸡/鸭/鹅" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>等级</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Button type="submit" disabled={create.isPending || update.isPending}>
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
            <DialogTitle>确认删除该供应商？</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-2">删除后不可恢复，请谨慎操作。</p>
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
