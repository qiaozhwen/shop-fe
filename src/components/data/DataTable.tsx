import * as React from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type Props<T> = {
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  pageSize?: number;
};
export function DataTable<T>({ columns, data, loading, searchPlaceholder = '搜索', toolbar, pageSize = 20 }: Props<T>) {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const table = useReactTable({
    data, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:px-5">
        <div className="relative w-full sm:w-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
          <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-8 w-full pl-8 text-[12px] sm:w-64" placeholder={searchPlaceholder} />
        </div>
        <div className="hidden flex-1 sm:block" />
        {toolbar && <div className="max-w-full overflow-x-auto">{toolbar}</div>}
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-[760px]">
          <Thead>
            {table.getHeaderGroups().map((hg) => (
              <Tr key={hg.id}>{hg.headers.map((h) => <Th key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</Th>)}</Tr>
            ))}
          </Thead>
          <Tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Tr key={i}>{columns.map((_c, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}</Tr>
                ))
              : table.getRowModel().rows.length === 0
                ? <Tr><Td colSpan={columns.length} className="text-center text-text-3 py-12">暂无数据</Td></Tr>
                : table.getRowModel().rows.map((r) => (
                    <Tr key={r.id}>{r.getVisibleCells().map((c) => <Td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</Td>)}</Tr>
                  ))}
          </Tbody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 border-t border-border text-[12px] text-text-3 sm:px-5">
        <span>共 {table.getFilteredRowModel().rows.length} 条</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>上一页</Button>
          <span className="tnum">{table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}</span>
          <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>下一页</Button>
        </div>
      </div>
    </div>
  );
}
