import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useMembers, useMemberMutations } from '@/hooks/usePeople';
import type { Member, MemberLevel } from '@/types/people';
import { MEMBER_LEVEL_LABEL } from '@/types/people';

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

type LevelTone = 'warn' | 'mute' | 'up' | 'info';
const LEVEL_TONE: Record<MemberLevel, LevelTone> = {
  BRONZE: 'warn',
  SILVER: 'mute',
  GOLD: 'up',
  DIAMOND: 'info',
};

type MemberFormValues = {
  cardNo: string;
  name: string;
  phone: string;
  level: MemberLevel;
  registerStoreName: string;
  remark: string;
};

const defaultFormValues: MemberFormValues = {
  cardNo: '',
  name: '',
  phone: '',
  level: 'BRONZE',
  registerStoreName: '',
  remark: '',
};

export default function MemberPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = useMembers({ page, pageSize, keyword });
  const { create, update } = useMemberMutations();
  const [editing, setEditing] = useState<Member | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<MemberFormValues>({ defaultValues: defaultFormValues });

  const openModal = (row?: Member) => {
    setEditing(row ?? null);
    if (row) {
      form.reset({
        cardNo: row.cardNo,
        name: row.name,
        phone: row.phone,
        level: row.level,
        registerStoreName: row.registerStoreName,
        remark: row.remark ?? '',
      });
    } else {
      form.reset(defaultFormValues);
    }
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (v) => {
    if (editing) await update.mutateAsync({ id: editing.id, ...v });
    else await create.mutateAsync({ ...v, registerStoreName: v.registerStoreName || '总店·城北店' });
    toast.success('已保存');
    setOpen(false);
  });

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const columns: ColumnDef<Member>[] = [
    {
      header: '卡号',
      accessorKey: 'cardNo',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px] text-text-2">{getValue<string>()}</span>
      ),
    },
    { header: '姓名', accessorKey: 'name' },
    {
      header: '手机',
      accessorKey: 'phone',
      cell: ({ getValue }) => (
        <span className="font-mono text-[12px]">{getValue<string>()}</span>
      ),
    },
    {
      header: '等级',
      accessorKey: 'level',
      cell: ({ getValue }) => {
        const v = getValue<MemberLevel>();
        return <Pill tone={LEVEL_TONE[v]}>{MEMBER_LEVEL_LABEL[v]}</Pill>;
      },
    },
    {
      header: '积分',
      accessorKey: 'points',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{getValue<number>()}</span>
      ),
    },
    {
      header: '余额',
      accessorKey: 'balance',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">¥{Number(getValue<number>()).toFixed(2)}</span>
      ),
    },
    {
      header: '累计消费',
      accessorKey: 'totalConsumption',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-danger">¥{Number(getValue<number>()).toFixed(2)}</span>
      ),
    },
    { header: '注册门店', accessorKey: 'registerStoreName' },
    {
      header: '注册时间',
      accessorKey: 'registeredAt',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-text-3">{getValue<string>()}</span>
      ),
    },
    {
      header: '操作',
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => openModal(row.original)}>
          <Pencil size={12} />
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="会员管理"
        sub="会员档案与积分余额"
        actions={
          <>
            <Input
              className="h-8 w-56 text-[12px]"
              placeholder="姓名 / 手机 / 卡号"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
            <Button onClick={() => openModal()}>
              <Plus size={14} />
              新增会员
            </Button>
          </>
        }
      />

      <DataTable<Member>
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? '编辑会员' : '新增会员'}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-1">
              <FormField
                control={form.control}
                name="cardNo"
                rules={{ required: '请输入卡号' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>卡号</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="level"
                rules={{ required: '请选择等级' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>等级</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v as MemberLevel)}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择等级" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(MEMBER_LEVEL_LABEL) as MemberLevel[]).map((k) => (
                          <SelectItem key={k} value={k}>{MEMBER_LEVEL_LABEL[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registerStoreName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>注册门店</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
    </div>
  );
}
