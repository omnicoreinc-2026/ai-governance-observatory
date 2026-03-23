"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import type { Framework, FrameworkStatus } from "@/lib/supabase/types";

const STATUS_COLORS: Record<FrameworkStatus, string> = {
  active: "#10B981",
  phased_enforcement: "#F59E0B",
  enacted: "#3B82F6",
  proposed: "#A1A1AA",
  in_force: "#EF4444",
  deprecated: "#71717A",
};

const STATUS_LABELS: Record<FrameworkStatus, string> = {
  active: "Active",
  phased_enforcement: "Phased Enforcement",
  enacted: "Enacted",
  proposed: "Proposed",
  in_force: "In Force",
  deprecated: "Deprecated",
};

export function FrameworksView(): JSX.Element {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("frameworks")
        .select("*")
        .order("last_updated", { ascending: false });
      setFrameworks(data ?? []);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs text-[#71717A] uppercase tracking-wider">
              <th className="px-4 py-3">Framework</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Jurisdiction</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Pillars</th>
            </tr>
          </thead>
          <tbody>
            {frameworks.map((fw) => (
              <tr
                key={fw.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[#FAFAFA]">{fw.name}</p>
                    {fw.short_name && (
                      <p className="text-[10px] text-[#71717A]">
                        {fw.short_name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${STATUS_COLORS[fw.status]}15`,
                      color: STATUS_COLORS[fw.status],
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: STATUS_COLORS[fw.status],
                      }}
                    />
                    {STATUS_LABELS[fw.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#A1A1AA]">
                  {fw.jurisdiction}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs ${
                      fw.framework_type === "mandatory"
                        ? "font-semibold text-[#EF4444]"
                        : fw.framework_type === "certifiable"
                          ? "text-[#F59E0B]"
                          : "text-[#A1A1AA]"
                    }`}
                  >
                    {fw.framework_type.charAt(0).toUpperCase() +
                      fw.framework_type.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#71717A]">
                  {formatDate(fw.last_updated)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {fw.pillars.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#A1A1AA]"
                      >
                        {p}
                      </span>
                    ))}
                    {fw.pillars.length > 3 && (
                      <span className="text-[10px] text-[#71717A]">
                        +{fw.pillars.length - 3}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {frameworks.length === 0 && (
          <div className="py-12 text-center text-sm text-[#71717A]">
            No frameworks found. Run the seed script.
          </div>
        )}
      </div>
    </div>
  );
}
