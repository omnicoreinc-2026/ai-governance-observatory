"use client";

import { Activity } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps): JSX.Element {
  return (
    <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#09090B]/80 px-6 py-4 backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold text-[#FAFAFA]">{title}</h2>
        {subtitle && (
          <p className="text-xs text-[#71717A]">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-[#71717A]">
        <Activity className="h-3 w-3 text-[#10B981]" />
        <span>Live</span>
      </div>
    </header>
  );
}
