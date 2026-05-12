import { useState } from 'react';
import { ArrowRight, User, AlertTriangle } from 'lucide-react';

import { useProcessingTasks, useProcessingMutations } from '@/hooks/useProcessing';
import { useAllStaff } from '@/hooks/usePeople';
import {
  PROCESSING_FLOW, PROCESSING_STATUS_LABEL,
} from '@/types/processing';
import type { ProcessingTask, ProcessingStatus } from '@/types/processing';
import { PROCESS_METHOD_LABEL } from '@/types/poultry';

import { PageHeader } from '@/components/layout/PageHeader';
import { CardBody } from '@/components/ui/card';
import { StatusPill } from '@/components/data/StatusPill';
import type { StatusKey } from '@/components/data/StatusPill';
import { Pill } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

const STATUS_TO_PILL: Record<ProcessingStatus, StatusKey> = {
  WAIT_SLAUGHTER: 'pending',
  SLAUGHTERING: 'processing',
  PLUCKING: 'processing',
  EVISCERATING: 'processing',
  PACKING: 'ready',
  DELIVERED: 'completed',
  CANCELED: 'cancelled',
};

function formatWait(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}分钟`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}小时${mins % 60}分`;
}

export default function ProcessingBoardPage() {
  const { data, isLoading } = useProcessingTasks({ pageSize: 200 });
  const { advance, assign } = useProcessingMutations();
  const { data: workers } = useAllStaff();
  const [assignTarget, setAssignTarget] = useState<ProcessingTask | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<number | undefined>();

  const grouped: Record<ProcessingStatus, ProcessingTask[]> = {
    WAIT_SLAUGHTER: [], SLAUGHTERING: [], PLUCKING: [],
    EVISCERATING: [], PACKING: [], DELIVERED: [], CANCELED: [],
  };
  (data?.list ?? []).forEach((t) => grouped[t.status]?.push(t));

  return (
    <div className="space-y-5">
      <PageHeader title="加工工单看板" />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {PROCESSING_FLOW.map((s) => (
            <div key={s} className="h-96 rounded-[12px] border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PROCESSING_FLOW.map((s) => (
            <div key={s} className="flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[13px] font-semibold text-text">
                  {PROCESSING_STATUS_LABEL[s]}
                </span>
                <Pill tone={grouped[s].length > 0 ? 'warn' : 'mute'}>
                  {grouped[s].length}
                </Pill>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-[480px] rounded-[12px] border border-border bg-[#F7F8F5] p-2">
                {grouped[s].length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-[12px] text-text-3 py-12">
                    暂无工单
                  </div>
                ) : (
                  grouped[s].map((t) => (
                    <div
                      key={t.id}
                      className={cn(
                        'rounded-[10px] border border-border bg-surface shadow-[var(--shadow-sm)] overflow-hidden',
                        (s === 'SLAUGHTERING' || s === 'PLUCKING' || s === 'EVISCERATING') && 'border-l-[3px] border-l-accent',
                      )}
                    >
                      <CardBody className="py-3 px-3 space-y-1.5">
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] text-text-2">{t.taskNo}</span>
                          {t.priority === 'URGENT' && (
                            <span className="flex items-center gap-0.5 text-[10px] text-danger font-semibold">
                              <AlertTriangle size={10} /> 急
                            </span>
                          )}
                        </div>

                        {/* Category & order */}
                        <div>
                          <p className="text-[13px] font-semibold text-text">{t.categoryName}</p>
                          <p className="text-[11px] text-text-3">订单 {t.orderNo}</p>
                        </div>

                        {/* Weight & qty */}
                        <p className="text-[12px] text-text-2">
                          {t.quantity} 只 · {t.weight} 斤
                        </p>

                        {/* Wait time */}
                        <p className="text-[11px] text-text-3">等待 {formatWait(t.createdAt)}</p>

                        {/* Methods */}
                        <div className="flex flex-wrap gap-1">
                          {t.methods.map((m) => (
                            <Pill key={m} tone="mute" className="text-[10px]">
                              {PROCESS_METHOD_LABEL[m]}
                            </Pill>
                          ))}
                        </div>

                        {/* Worker */}
                        <div className="flex items-center gap-1 text-[11px]">
                          <User size={11} className="text-text-3" />
                          {t.workerName
                            ? <span className="text-text-2">{t.workerName}</span>
                            : <span className="text-warning">未指派</span>
                          }
                        </div>

                        {/* Status pill */}
                        <StatusPill status={STATUS_TO_PILL[t.status]} />

                        {/* Actions */}
                        <div className="flex gap-1.5 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-[11px]"
                            onClick={() => { setAssignTarget(t); setSelectedWorker(t.workerId); }}
                          >
                            指派
                          </Button>
                          {s !== 'DELIVERED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 text-[11px]"
                              onClick={() => advance.mutate(t.id, { onSuccess: () => toast.success('已推进') })}
                            >
                              下一步 <ArrowRight size={11} />
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(open) => { if (!open) setAssignTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>指派屠宰工 — {assignTarget?.taskNo ?? ''}</DialogTitle>
          </DialogHeader>
          <Select
            value={selectedWorker !== undefined ? String(selectedWorker) : undefined}
            onValueChange={(v) => setSelectedWorker(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择屠宰工 / 帮工" />
            </SelectTrigger>
            <SelectContent>
              {(workers ?? [])
                .filter((w) => w.role === 'BUTCHER' || w.role === 'HELPER')
                .map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}（{w.storeName}）
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignTarget(null)}>取消</Button>
            <Button
              variant="primary"
              onClick={() => {
                const w = workers?.find((x) => x.id === selectedWorker);
                if (!assignTarget || !w) return;
                assign.mutate(
                  { id: assignTarget.id, workerId: w.id, workerName: w.name },
                  { onSuccess: () => { toast.success('已指派'); setAssignTarget(null); } },
                );
              }}
            >
              确认指派
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
