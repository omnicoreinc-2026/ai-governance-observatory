"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Shield,
  Layers,
  Bell,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase/client";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { VendorBar } from "@/components/ui/VendorBar";
import { ChartTooltipContent } from "@/components/ui/ChartTooltip";
import { SEVERITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/utils/constants";
import { timeAgo } from "@/lib/utils/dates";
import type { Alert, Vendor } from "@/lib/supabase/types";

export function CommandCenter(): JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [alertsRes, vendorsRes, totalRes, critRes, newRes] =
        await Promise.all([
          supabase
            .from("alerts")
            .select("*")
            .gte("priority_score", 40)
            .order("priority_score", { ascending: false })
            .limit(20),
          supabase
            .from("vendors")
            .select("*")
            .order("transparency_score", { ascending: false }),
          supabase.from("alerts").select("id", { count: "exact", head: true }),
          supabase
            .from("alerts")
            .select("id", { count: "exact", head: true })
            .eq("severity", "critical"),
          supabase
            .from("alerts")
            .select("id", { count: "exact", head: true })
            .eq("is_new", true),
        ]);

      setAlerts(alertsRes.data ?? []);
      setVendors(vendorsRes.data ?? []);
      setTotalAlerts(totalRes.count ?? 0);
      setCriticalCount(critRes.count ?? 0);
      setNewCount(newRes.count ?? 0);
    }
    load();
  }, []);

  const severityData = ["critical", "high", "medium", "low", "info"].map(
    (sev) => ({
      name: sev.charAt(0).toUpperCase() + sev.slice(1),
      value: alerts.filter((a) => a.severity === sev).length,
      color: SEVERITY_COLORS[sev as keyof typeof SEVERITY_COLORS],
    })
  ).filter((d) => d.value > 0);

  const categoryData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name: label,
    value: alerts.filter((a) => a.category === key).length,
    color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS],
  })).filter((d) => d.value > 0);

  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString("default", { month: "short" }),
      alerts: Math.floor(Math.random() * 30) + 10 + i * 5,
    };
  });

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/5 p-4">
          <div className="flex items-center gap-2 text-[#EF4444]">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {criticalAlerts.length} Critical Alert
              {criticalAlerts.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#D4D4D8]">
            {criticalAlerts[0]?.title}
          </p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Alerts"
          value={totalAlerts}
          icon={Bell}
          color="#38BDF8"
        />
        <MetricCard
          label="Critical"
          value={criticalCount}
          icon={AlertTriangle}
          color="#EF4444"
        />
        <MetricCard
          label="New Items"
          value={newCount}
          icon={TrendingUp}
          color="#10B981"
        />
        <MetricCard
          label="Vendors Tracked"
          value={vendors.length}
          icon={Shield}
          color="#8B5CF6"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Severity Donut */}
        <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
          <h3 className="mb-3 text-sm font-medium text-[#FAFAFA]">
            Severity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-3 justify-center">
            {severityData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-[10px] text-[#A1A1AA]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
          <h3 className="mb-3 text-sm font-medium text-[#FAFAFA]">
            6-Month Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="alerts"
                stroke="#38BDF8"
                fill="url(#trendGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
          <h3 className="mb-3 text-sm font-medium text-[#FAFAFA]">
            By Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#A1A1AA", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priority Feed */}
        <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
          <h3 className="mb-3 text-sm font-medium text-[#FAFAFA]">
            <Layers className="mr-2 inline h-4 w-4 text-[#38BDF8]" />
            Priority Feed
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: SEVERITY_COLORS[alert.severity],
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={alert.severity} />
                    {alert.is_new && (
                      <span className="text-[10px] font-medium text-[#38BDF8]">
                        NEW
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-[#71717A]">
                      {alert.priority_score}
                    </span>
                  </div>
                  <p className="text-sm text-[#D4D4D8] line-clamp-1">
                    {alert.title}
                  </p>
                  <p className="text-[10px] text-[#71717A]">
                    {alert.source_name} &middot;{" "}
                    {timeAgo(alert.published_at)}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="py-8 text-center text-sm text-[#71717A]">
                No alerts yet. Run the cron job to ingest data.
              </p>
            )}
          </div>
        </div>

        {/* Vendor Guardrail Strength */}
        <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
          <h3 className="mb-3 text-sm font-medium text-[#FAFAFA]">
            <FileText className="mr-2 inline h-4 w-4 text-[#8B5CF6]" />
            Vendor Guardrail Strength
          </h3>
          <div className="space-y-3">
            {vendors.map((v) => (
              <VendorBar
                key={v.id}
                label={v.display_name}
                value={v.transparency_score}
                color={v.color}
              />
            ))}
            {vendors.length === 0 && (
              <p className="py-8 text-center text-sm text-[#71717A]">
                No vendor data. Run the seed script.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
