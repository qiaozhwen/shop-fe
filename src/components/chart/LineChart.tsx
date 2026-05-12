import { ResponsiveContainer, LineChart as RC, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Props = { data: any[]; xKey: string; lines: { key: string; color?: string; name?: string }[]; height?: number };
export function LineChart({ data, xKey, lines, height = 240 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#EEF1EA" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }} />
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color ?? (i === 0 ? 'var(--primary)' : '#B6C2BB')}
            strokeDasharray={i === 0 ? undefined : '4 4'} strokeWidth={2} dot={false} name={l.name} />
        ))}
      </RC>
    </ResponsiveContainer>
  );
}
