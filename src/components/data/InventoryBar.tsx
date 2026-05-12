export function InventoryBar({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, (value / total) * 100);
  const color = pct < 20 ? 'var(--danger)' : pct < 40 ? 'var(--accent)' : 'var(--primary)';
  return (
    <div className="w-full h-[5px] rounded-[3px] bg-[#F1F3EE] overflow-hidden">
      <div className="h-full rounded-[3px] transition-[width]" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
