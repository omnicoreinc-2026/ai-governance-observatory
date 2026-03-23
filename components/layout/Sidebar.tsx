"use client";

import {
  LayoutDashboard,
  Bell,
  Shield,
  Layers,
  Clock,
  Database,
} from "lucide-react";
import { NavItem } from "@/components/ui/NavItem";

const NAV_ITEMS = [
  { key: "command", label: "Command Center", icon: LayoutDashboard },
  { key: "feed", label: "Intelligence Feed", icon: Bell },
  { key: "vendors", label: "Vendor Matrix", icon: Shield },
  { key: "frameworks", label: "Frameworks", icon: Layers },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "sources", label: "Data Sources", icon: Database },
] as const;

export type ViewKey = (typeof NAV_ITEMS)[number]["key"];

interface SidebarProps {
  activeView: ViewKey;
  onViewChange: (view: ViewKey) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps): JSX.Element {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-white/[0.06] bg-[#09090B]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-4">
        <Shield className="h-6 w-6 text-[#38BDF8]" />
        <div>
          <h1 className="text-sm font-semibold text-[#FAFAFA]">AI Governance</h1>
          <p className="text-[10px] text-[#71717A]">Observatory</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.key}
            label={item.label}
            icon={item.icon}
            active={activeView === item.key}
            onClick={() => onViewChange(item.key)}
          />
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="rounded-[10px] bg-white/[0.025] p-3">
          <p className="text-[10px] text-[#71717A] uppercase tracking-wider">
            Last Refresh
          </p>
          <p className="mt-1 font-mono text-xs text-[#A1A1AA]">
            Scheduled 2x daily
          </p>
        </div>
      </div>
    </aside>
  );
}
