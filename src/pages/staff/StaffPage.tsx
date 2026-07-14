import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useStaff, useStaffMutations } from '@/hooks/usePeople';
import { useAllStores } from '@/hooks/useStores';
import type { Staff, StaffRole } from '@/types/people';
import { STAFF_ROLE_LABEL } from '@/types/people';

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

type RoleTone = 'warn' | 'info' | 'down' | 'mute';
const ROLE_TONE: Record<StaffRole, RoleTone> = {
  ADMIN: 'warn',
  MANAGER: 'warn',
  CASHIER: 'info',
  BUTCHER: 'down',
  HELPER: 'mute',
};

type StaffFormValues = {
  name: string;
  phone: string;
  password: string;
  role: StaffRole;
  storeId: number;
  hireDate: string;
  enabled: boolean;
  remark: string;
};

const today = new Date().toISOString().slice(0, 10);

const defaultFormValues: StaffFormValues = {
  name: '',
  phone: '',
  password: '',
  role: 'CASHIER',
  storeId: 0,
  hireDate: today,
  enabled: true,
  remark: '',
};

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<StaffRole | undefined>();
  const [storeId, setStoreId] = useState<number | undefined>();
  const { data, isLoading } = useStaff({ page, pageSize, keyword, role, storeId });
  const { create, update, remove } = useStaffMutations();
  const { data: stores } = useAllStores();
  const [editing, setEditing] = useState<Staff | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  const form = useForm<StaffFormValues>({ defaultValues: defaultFormValues });

  const openModal = (row?: Staff) => {
    setEditing(row ?? null);
    if (row) {
      form.reset({
        name: row.name,
        phone: row.phone,
        password: '',
        role: row.role,
        storeId: row.storeId,
        hireDate: row.hireDate ?? today,
        enabled: row.enabled,
        remark: row.remark ?? '',
      });
    } else {
      form.reset(defaultFormValues);
    }
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (v) => {
    const st = stores?.find((s) => s.id === v.storeId);
    const { password, ...staffFields } = v;
    const payload = { ...staffFields, storeName: st?.name ?? '', hireDate: v.hireDate };
    if (editing) await update.mutateAsync({ id: editing.id, ...payload });
    else await create.mutateAsync({ ...payload, password });
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

  const columns: ColumnDef<Staff>[] = [
    { header: '姓名', accessorKey: 'name' },
    {
      header: '手机',
      accessorKey: 'phone',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px]">{getValue<string>()}</span>
      ),
    },
    {
      header: '岗位',
      accessorKey: 'role',
      cell: ({ getValue }) => {
        const v = getValue<StaffRole>();
        return <Pill tone={ROLE_TONE[v]}>{STAFF_ROLE_LABEL[v]}</Pill>;
      },
    },
    { header: '所属门店', accessorKey: 'storeName' },
    {
      header: '入职日期',
      accessorKey: 'hireDate',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    {
      header: '状态',
      accessorKey: 'enabled',
      cell: ({ getValue }) =>
        getValue<boolean>()
          ? <Pill tone="up">在职</Pill>
          : <Pill tone="mute">离职</Pill>,
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openModal(row.original)}>
            <Pencil size={12} />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={() => setDeleteTarget(row.original)}
          >
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
        title="员工管理"
        sub="门店员工档案与岗位"
        actions={
          <>
            <Select
              value={role ?? 'ALL'}
              onValueChange={(v) => { setRole(v === 'ALL' ? undefined : v as StaffRole); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-28 text-[12px]">
                <SelectValue placeholder="岗位" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部</SelectItem>
                {(Object.keys(STAFF_ROLE_LABEL) as StaffRole[]).map((k) => (
                  <SelectItem key={k} value={k}>{STAFF_ROLE_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={storeId ? String(storeId) : 'ALL'}
              onValueChange={(v) => { setStoreId(v === 'ALL' ? undefined : Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-36 text-[12px]">
                <SelectValue placeholder="门店" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部门店</SelectItem>
                {(stores ?? []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-8 w-48 text-[12px]"
              placeholder="姓名 / 手机"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
            <Button onClick={() => openModal()}>
              <Plus size={14} />
              新增员工
            </Button>
          </>
        }
      />

      <DataTable<Staff>
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
            <SheetTitle>{editing ? '编辑员工' : '新增员工'}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-1">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: '请输入姓名' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: '请输入手机号',
                  pattern: { value: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机</FormLabel>
                    <FormControl><Input {...field} maxLength={11} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editing && (
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: '请输入初始密码',
                    minLength: { value: 8, message: '初始密码至少 8 位' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>初始密码</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="role"
                rules={{ required: '请选择岗位' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>岗位</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v as StaffRole)}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择岗位" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(STAFF_ROLE_LABEL) as StaffRole[]).map((k) => (
                          <SelectItem key={k} value={k}>{STAFF_ROLE_LABEL[k]}</SelectItem>
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
                    <FormLabel>所属门店</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择门店" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(stores ?? []).map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hireDate"
                rules={{ required: '请选择入职日期' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入职日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={[
                          'inline-flex items-center gap-1.5 h-7 px-3 rounded-[8px] text-[12px] font-medium border transition-colors',
                          field.value
                            ? 'bg-primary-50 border-primary text-primary'
                            : 'bg-surface border-border text-text-2',
                        ].join(' ')}
                      >
                        <span className={[
                          'w-2 h-2 rounded-full',
                          field.value ? 'bg-primary' : 'bg-text-3',
                        ].join(' ')} />
                        {field.value ? '在职' : '离职'}
                      </button>
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
            <DialogTitle>确认删除员工？</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-2">
            将删除员工 <span className="font-semibold">{deleteTarget?.name}</span>，此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button variant="danger" disabled={remove.isPending} onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
