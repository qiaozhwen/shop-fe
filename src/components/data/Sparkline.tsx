export function Sparkline({ data, width = 80, height = 32 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const dx = width / (data.length - 1);
  const norm = (v: number) => height - ((v - min) / Math.max(1, max - min)) * (height - 4) - 2;
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * dx).toFixed(1)},${norm(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
