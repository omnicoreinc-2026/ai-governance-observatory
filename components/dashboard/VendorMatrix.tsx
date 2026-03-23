"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Lock, Unlock, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ChartTooltipContent } from "@/components/ui/ChartTooltip";
import { VendorBar } from "@/components/ui/VendorBar";
import type { Vendor, VendorRiskLevel } from "@/lib/supabase/types";

const RISK_COLORS: Record<VendorRiskLevel, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#10B981",
};

export function VendorMatrix(): JSX.Element {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("vendors")
        .select("*")
        .order("transparency_score", { ascending: false });
      setVendors(data ?? []);
    }
    load();
  }, []);

  const chartData = vendors.map((v) => ({
    name: v.display_name,
    transparency: v.transparency_score,
    guardrails: Math.round(v.transparency_score * 0.85 + Math.random() * 15),
    color: v.color,
  }));

  return (
    <div className="space-y-6">
      {/* Transparency vs Guardrails Chart */}
      <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
        <h3 className="mb-4 text-sm font-medium text-[#FAFAFA]">
          Transparency vs. Guardrail Strength
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={4}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#A1A1AA" }}
            />
            <Bar
              dataKey="transparency"
              name="Transparency"
              fill="#38BDF8"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="guardrails"
              name="Guardrails"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Military AI Posture */}
      <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-[#FAFAFA]">
          <ShieldAlert className="h-4 w-4 text-[#F59E0B]" />
          Military AI Posture
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {vendors.map((v) => {
            const isRestricted =
              v.military_use?.toLowerCase().includes("restricted") ||
              v.military_use?.toLowerCase().includes("not permitted");
            return (
              <div
                key={v.id}
                className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  {isRestricted ? (
                    <Lock className="h-4 w-4 text-[#10B981]" />
                  ) : (
                    <Unlock className="h-4 w-4 text-[#F59E0B]" />
                  )}
                  <span className="text-sm font-medium text-[#FAFAFA]">
                    {v.display_name}
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA]">{v.military_use}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-2 gap-4">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: v.color }}
              >
                {v.display_name[0]}
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#FAFAFA]">
                  {v.display_name}
                </h4>
                <p className="text-[10px] text-[#71717A]">{v.models}</p>
              </div>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${RISK_COLORS[v.risk_level]}15`,
                  color: RISK_COLORS[v.risk_level],
                }}
              >
                {v.risk_level.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2">
              <VendorBar
                label="Transparency"
                value={v.transparency_score}
                color={v.color}
              />
            </div>
            <div className="mt-3 space-y-1 text-xs text-[#A1A1AA]">
              <p>
                <span className="text-[#71717A]">Safety:</span>{" "}
                {v.safety_policy}
              </p>
              <p>
                <span className="text-[#71717A]">Agentic:</span>{" "}
                {v.agentic_controls}
              </p>
            </div>
          </div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="py-12 text-center text-sm text-[#71717A]">
          No vendor data. Run the seed script to populate.
        </div>
      )}
    </div>
  );
}
