import { ResponsiveContainer, BarChart as RC, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Props = { data: any[]; xKey: string; bars: { key: string; color?: string; name?: string }[]; height?: number };
export function BarChart({ data, xKey, bars, height = 240 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#EEF1EA" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }} cursor={{ fill: 'var(--primary-50)' }} />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} fill={b.color ?? 'var(--primary)'} radius={[4, 4, 0, 0]} barSize={18} name={b.name} />
        ))}
      </RC>
    </ResponsiveContainer>
  );
}
