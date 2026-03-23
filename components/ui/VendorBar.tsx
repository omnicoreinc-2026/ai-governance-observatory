interface VendorBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}

export function VendorBar({
  label,
  value,
  maxValue = 100,
  color,
}: VendorBarProps): JSX.Element {
  const pct = Math.min(100, (value / maxValue) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#D4D4D8]">{label}</span>
        <span className="font-mono text-[#A1A1AA]">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06]">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
