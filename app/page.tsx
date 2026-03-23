"use client";

import { useState } from "react";
import { Sidebar, type ViewKey } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandCenter } from "@/components/dashboard/CommandCenter";
import { IntelligenceFeed } from "@/components/dashboard/IntelligenceFeed";
import { VendorMatrix } from "@/components/dashboard/VendorMatrix";
import { FrameworksView } from "@/components/dashboard/FrameworksView";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { DataSourcesView } from "@/components/dashboard/DataSourcesView";

const VIEW_CONFIG: Record<ViewKey, { title: string; subtitle: string }> = {
  command: {
    title: "Command Center",
    subtitle: "High-priority alerts and governance metrics",
  },
  feed: {
    title: "Intelligence Feed",
    subtitle: "All alerts with search and filters",
  },
  vendors: {
    title: "Vendor Matrix",
    subtitle: "AI vendor transparency and guardrail analysis",
  },
  frameworks: {
    title: "Frameworks",
    subtitle: "Governance frameworks and regulations tracker",
  },
  timeline: {
    title: "Timeline",
    subtitle: "Regulatory milestones and enforcement events",
  },
  sources: {
    title: "Data Sources",
    subtitle: "Feed source status and pipeline health",
  },
};

export default function Dashboard(): React.ReactElement {
  const [activeView, setActiveView] = useState<ViewKey>("command");
  const config = VIEW_CONFIG[activeView];

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="ml-56 flex-1">
        <Header title={config.title} subtitle={config.subtitle} />
        <div className="p-6">
          {activeView === "command" && <CommandCenter />}
          {activeView === "feed" && <IntelligenceFeed />}
          {activeView === "vendors" && <VendorMatrix />}
          {activeView === "frameworks" && <FrameworksView />}
          {activeView === "timeline" && <TimelineView />}
          {activeView === "sources" && <DataSourcesView />}
        </div>
      </main>
    </div>
  );
}
