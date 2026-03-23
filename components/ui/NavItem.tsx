"use client";

import { type LucideIcon } from "lucide-react";

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}

export function NavItem({
  label,
  icon: Icon,
  active = false,
  onClick,
}: NavItemProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-white/[0.06] text-[#FAFAFA]"
          : "text-[#A1A1AA] hover:bg-white/[0.025] hover:text-[#D4D4D8]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
