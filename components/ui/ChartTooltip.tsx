"use client";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipProps): JSX.Element | null {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#18181B] px-3 py-2 shadow-lg">
      {label && (
        <p className="mb-1 text-xs text-[#A1A1AA]">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#D4D4D8]">{entry.name}:</span>
          <span className="font-medium text-[#FAFAFA]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
