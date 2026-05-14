import { Pill } from '@/components/ui/pill';

const map = {
  pending: { tone: 'mute', label: '待处理' },
  processing: { tone: 'warn', label: '加工中' },
  ready: { tone: 'info', label: '待取' },
  completed: { tone: 'up', label: '已完成' },
  cancelled: { tone: 'down', label: '已取消' },
  refunded: { tone: 'info', label: '已退款' },
  low: { tone: 'down', label: '低库存' },
  ok: { tone: 'up', label: '正常' },
} as const;

export type StatusKey = keyof typeof map;
export function StatusPill({ status, pulse }: { status: StatusKey; pulse?: boolean }) {
  const cfg = map[status];
  return (
    <Pill tone={cfg.tone as any}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {cfg.label}
    </Pill>
  );
}
