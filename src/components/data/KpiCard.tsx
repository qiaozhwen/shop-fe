import { Card } from '@/components/ui/card';
import { Sparkline } from './Sparkline';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/cn';

type Props = {
  label: string;
  value: string;
  meta?: { tone: 'up' | 'down' | 'warn' | 'info' | 'mute'; text: string }[];
  trend?: number[];
  valueColor?: 'text' | 'accent' | 'danger';
};
export function KpiCard({ label, value, meta, trend, valueColor = 'text' }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-3">{label}</div>
      <div className={cn('text-[28px] font-bold tnum leading-none',
        valueColor === 'accent' && 'text-accent',
        valueColor === 'danger' && 'text-danger')}>{value}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {meta?.map((m, i) => <Pill key={i} tone={m.tone}>{m.text}</Pill>)}
        </div>
        {trend && <Sparkline data={trend} />}
      </div>
    </Card>
  );
}
