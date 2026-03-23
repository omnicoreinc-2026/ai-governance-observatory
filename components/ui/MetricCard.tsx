"use client";

import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = "#38BDF8",
  trend,
}: MetricCardProps): JSX.Element {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#71717A] uppercase tracking-wider">
          {label}
        </span>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#FAFAFA]">{value}</span>
        {trend && (
          <span className="text-xs text-[#A1A1AA]">{trend}</span>
        )}
      </div>
    </div>
  );
}
