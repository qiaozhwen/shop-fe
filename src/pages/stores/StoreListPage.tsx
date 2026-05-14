import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import {
  useStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
} from '@/hooks/useStores';
import type { Store, StoreStatus } from '@/types/store';
import { STORE_STATUS_LABEL } from '@/types/store';

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
import StoreDetailDrawer from './StoreDetailDrawer';

type StatusTone = 'up' | 'down' | 'warn';
const STATUS_TONE: Record<StoreStatus, StatusTone> = {
  OPEN: 'up',
  CLOSED: 'down',
  RENOVATING: 'warn',
};

type StoreFormValues = {
  code: string;
  name: string;
  address: string;
  phone: string;
  ownerName: string;
  status: StoreStatus;
  openTime: string;
  closeTime: string;
  remark: string;
};

const defaultFormValues: StoreFormValues = {
  code: '',
  name: '',
  address: '',
  phone: '',
  ownerName: '',
  status: 'OPEN',
  openTime: '',
  closeTime: '',
  remark: '',
};

export default function StoreListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StoreStatus | undefined>();
  const { data, isLoading } = useStores({ page, pageSize, keyword, status });
  const create = useCreateStore();
  const update = useUpdateStore();
  const remove = useDeleteStore();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStore, setDetailStore] = useState<Store | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);

  const form = useForm<StoreFormValues>({ defaultValues: defaultFormValues });

  const openDetail = (row: Store) => {
    setDetailStore(row);
    setDetailOpen(true);
  };

  const openModal = (row?: Store) => {
    setEditing(row ?? null);
    if (row) {
      form.reset({
        code: row.code,
        name: row.name,
        address: row.address,
        phone: row.phone,
        ownerName: row.ownerName,
        status: row.status,
        openTime: row.openTime ?? '',
        closeTime: row.closeTime ?? '',
        remark: row.remark ?? '',
      });
    } else {
      form.reset(defaultFormValues);
    }
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (v) => {
    const payload = {
      ...v,
      openTime: v.openTime || undefined,
      closeTime: v.closeTime || undefined,
    };
    if (editing) await update.mutateAsync({ id: editing.id, ...payload });
    else await create.mutateAsync(payload);
    toast.success('已保存');
    setOpen(false);
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await remove.mutateAsync(deleteTarget.id);
    toast.success('已删除');
    setDeleteTarget(null);
  };

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const columns: ColumnDef<Store>[] = [
    {
      header: '编码',
      accessorKey: 'code',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    { header: '门店名称', accessorKey: 'name' },
    { header: '地址', accessorKey: 'address' },
    {
      header: '电话',
      accessorKey: 'phone',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px]">{getValue<string>()}</span>
      ),
    },
    { header: '店长', accessorKey: 'ownerName' },
    {
      header: '营业时间',
      id: 'hours',
      cell: ({ row }) => (
        <span className="text-[12px] text-text-2">
          {row.original.openTime ?? '-'} ~ {row.original.closeTime ?? '-'}
        </span>
      ),
    },
    {
      header: '状态',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const s = getValue<StoreStatus>();
        return <Pill tone={STATUS_TONE[s]}>{STORE_STATUS_LABEL[s]}</Pill>;
      },
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openDetail(row.original)}>
            <Eye size={12} />
            详情
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openModal(row.original)}>
            <Pencil size={12} />
            编辑
          </Button>
          <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setDeleteTarget(row.original)}>
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
        title="门店管理"
        sub="门店列表与基本信息"
        actions={
          <>
            <Input
              className="h-8 w-56 text-[12px]"
              placeholder="名称 / 编码 / 地址"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
            <Select value={status ?? ''} onValueChange={(v) => { setStatus(v ? v as StoreStatus : undefined); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-[12px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                {(Object.keys(STORE_STATUS_LABEL) as StoreStatus[]).map((k) => (
                  <SelectItem key={k} value={k}>{STORE_STATUS_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => openModal()}>
              <Plus size={14} />
              新增门店
            </Button>
          </>
        }
      />

      <DataTable<Store>
        columns={columns}
        data={data?.list ?? []}
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

      {/* Create / Edit Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? '编辑门店' : '新增门店'}</SheetTitle>
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
                    <FormControl><Input {...field} disabled={!!editing} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                rules={{ required: '请输入门店名称' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>门店名称</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                rules={{ required: '请输入地址' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地址</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: '请输入电话',
                  pattern: { value: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电话</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerName"
                rules={{ required: '请输入店长姓名' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>店长</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                rules={{ required: '请选择状态' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v as StoreStatus)}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择状态" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(STORE_STATUS_LABEL) as StoreStatus[]).map((k) => (
                          <SelectItem key={k} value={k}>{STORE_STATUS_LABEL[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="openTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>开门时间</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="closeTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>关门时间</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
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
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>取消</Button>
                <Button type="submit" disabled={create.isPending || update.isPending}>保存</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除门店？</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-2">
            将删除 <span className="font-semibold">{deleteTarget?.name}</span>，此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button variant="danger" disabled={remove.isPending} onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StoreDetailDrawer
        open={detailOpen}
        store={detailStore}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
