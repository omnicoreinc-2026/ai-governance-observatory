"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Shield, AlertTriangle, Eye, Layers, Clock, Database,
  ChevronRight, Search, Filter, Bell, Radio, Zap,
  Building2, Globe2, Scale, FileText, TrendingUp,
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle,
  AlertCircle, Info, ChevronDown, ExternalLink, Tag,
  Activity, BarChart3, Cpu, Lock, Unlock, Users,
} from "lucide-react";

const SEV: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "CRITICAL" },
  high:     { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "HIGH" },
  medium:   { color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", label: "MEDIUM" },
  low:      { color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", label: "LOW" },
  info:     { color: "#6B7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)", label: "INFO" },
};

const CATS: Record<string, { icon: any; color: string; label: string }> = {
  regulatory:       { icon: Scale,      color: "#F59E0B", label: "Regulatory" },
  vendor_guardrails:{ icon: Shield,     color: "#8B5CF6", label: "Vendor Guardrails" },
  frameworks:       { icon: Layers,     color: "#3B82F6", label: "Frameworks" },
  safety_research:  { icon: Eye,        color: "#EC4899", label: "Safety Research" },
  enforcement:      { icon: AlertCircle,color: "#EF4444", label: "Enforcement" },
  standards:        { icon: FileText,   color: "#10B981", label: "Standards" },
};

const VENDORS_DATA = [
  { name: "OpenAI",     color: "#10A37F", models: "GPT-5, o3, o4-mini",              transparency: 65, risk: "medium", military: "Permitted", safety: "Usage Policy + Model Spec", lastChange: "2026-03", guardrails: 72 },
  { name: "Anthropic",  color: "#D4A574", models: "Claude 4.6 Opus/Sonnet/Haiku",    transparency: 78, risk: "low",    military: "Restricted", safety: "Frontier Safety Roadmap", lastChange: "2026-02", guardrails: 88 },
  { name: "Google",     color: "#4285F4", models: "Gemini 2.5 Pro/Flash",             transparency: 60, risk: "medium", military: "Selective", safety: "Frontier Safety Framework", lastChange: "2026-01", guardrails: 70 },
  { name: "Meta",       color: "#0668E1", models: "Llama 4, Scout/Maverick",          transparency: 55, risk: "high",   military: "Unrestricted", safety: "Responsible Use Guide", lastChange: "2025-12", guardrails: 45 },
  { name: "Microsoft",  color: "#00BCF2", models: "Copilot, Azure AI",                transparency: 62, risk: "medium", military: "Full DoD", safety: "Responsible AI Standard v3", lastChange: "2026-02", guardrails: 68 },
  { name: "xAI",        color: "#A855F7", models: "Grok 3, Grok 3 Mini",             transparency: 20, risk: "high",   military: "DoD Contract", safety: "Minimal Published", lastChange: "2025-11", guardrails: 22 },
];

const ALERTS = [
  { id: 1, sev: "critical", cat: "vendor_guardrails", title: "Anthropic Replaces RSP with Nonbinding Frontier Safety Roadmap", summary: "Previous hard commitment to pause training if capabilities outstrip controls removed. Shift to public goals and flexible framework citing competitive pressure.", source: "CNN Business", url: "https://www.cnn.com/2026/02/25/tech/anthropic-safety-policy-change", vendor: "Anthropic", ts: "2026-02-25T14:30:00Z", isNew: true, score: 95 },
  { id: 2, sev: "critical", cat: "enforcement", title: "Pentagon Threatens Defense Production Act Against Anthropic Over AI Red Lines", summary: "DoD demanded 'any lawful use' language in $200M contract. Would permit autonomous weapons and mass surveillance deployment. Anthropic CEO declined. DPA invocation threatened.", source: "Lawfare", url: "https://www.lawfaremedia.org/article/what-the-defense-production-act-can-and-can%27t-do-to-anthropic", vendor: "Anthropic", ts: "2026-02-27T17:01:00Z", isNew: true, score: 98 },
  { id: 3, sev: "critical", cat: "safety_research", title: "Industry-Wide Safety Guardrail Erosion Under Competitive Pressure", summary: "All major AI labs loosening safety guardrails. Global AI summits shifting from guardrails to commercialization. Voluntary pledges failing as race dynamics intensify.", source: "Axios", url: "https://www.axios.com/2026/03/03/ai-race-safety-guardrail", vendor: null, ts: "2026-03-03T08:00:00Z", isNew: true, score: 92 },
  { id: 4, sev: "high", cat: "vendor_guardrails", title: "OpenAI Strikes Pentagon Deal Hours After Anthropic Standoff", summary: "Amended deal reportedly includes surveillance limits but contract language permits broad military use. Details under continued review.", source: "CNBC", url: "https://www.cnbc.com/2026/02/27/openai-strikes-deal-with-pentagon-hours-after-rival-anthropic-was-blacklisted-by-trump.html", vendor: "OpenAI", ts: "2026-02-27T20:00:00Z", isNew: true, score: 82 },
  { id: 5, sev: "high", cat: "regulatory", title: "EU AI Act: Annex III High-Risk Rules Take Effect August 2026", summary: "Organizations must demonstrate full data lineage, human-in-the-loop checkpoints, and risk classification tags. Non-compliance risks EU market access bans.", source: "EU AI Act", url: "https://artificialintelligenceact.eu/annex/3/", vendor: null, ts: "2026-03-15T09:00:00Z", isNew: true, score: 85 },
  { id: 6, sev: "high", cat: "safety_research", title: "Only 3 of 7 Frontier Labs Substantively Test for Dangerous Capabilities", summary: "FLI Safety Index: Anthropic, OpenAI, and Google DeepMind only firms with real catastrophic risk testing. Gap widening. External evaluations minimal across the board.", source: "Future of Life Institute", url: "https://futureoflife.org/ai-safety-index-winter-2025/", vendor: null, ts: "2026-01-14T12:00:00Z", isNew: false, score: 78 },
  { id: 7, sev: "high", cat: "regulatory", title: "Trump Executive Order Targets State AI Laws via Litigation", summary: "December order directed AG to challenge state AI laws conflicting with 'minimally burdensome' federal framework. Relies on litigation, not preemptive legislation. Prolonged uncertainty.", source: "MIT Technology Review", url: "https://www.technologyreview.com/2026/01/23/1131559/americas-coming-war-over-ai-regulation/", vendor: null, ts: "2026-01-05T14:00:00Z", isNew: false, score: 75 },
  { id: 8, sev: "medium", cat: "enforcement", title: "Bipartisan State AGs Warn AI Firms Over Harmful Chatbot Outputs", summary: "Letters to Meta, Google, OpenAI demanding stronger safeguards. Called outputs 'sycophantic and delusional.' Demanded audits and transparency by Jan 16, 2026.", source: "NY Attorney General", url: "https://ag.ny.gov/press-release/2025/attorney-general-james-and-bipartisan-coalition-urge-big-tech-companies-address", vendor: null, ts: "2025-12-12T10:00:00Z", isNew: false, score: 58 },
  { id: 9, sev: "medium", cat: "standards", title: "NIST Publishes AI Standards Evaluation Approach (GCR-26-069)", summary: "New framework for evaluating effectiveness and relative value of AI standards development. Intended to stimulate structured measurement of standards impact on innovation and trust.", source: "NIST", url: "https://nvlpubs.nist.gov/nistpubs/gcr/2026/NIST.GCR.26-069.pdf", vendor: null, ts: "2026-01-15T08:00:00Z", isNew: false, score: 52 },
  { id: 10, sev: "medium", cat: "frameworks", title: "Partnership on AI: Six Governance Priorities for 2026", summary: "Scalable evaluation frameworks, accountability infrastructure for agentic AI, assurance mechanisms, documentation artifacts across AI value chain, sovereignty strategies.", source: "Partnership on AI", url: "https://partnershiponai.org/resource/six-ai-governance-priorities/", vendor: null, ts: "2026-02-19T11:00:00Z", isNew: false, score: 55 },
  { id: 11, sev: "medium", cat: "safety_research", title: "Shadow AI Driving $670K Average Additional Breach Costs", summary: "IBM research: organizations with unmanaged AI observe significant cost increases. Highlights critical need for AI inventory, usage governance, and shadow AI detection.", source: "VentureBeat", url: "https://venturebeat.com/security/ibm-shadow-ai-breaches-cost-670k-more-97-of-firms-lack-controls/", vendor: null, ts: "2026-02-01T10:00:00Z", isNew: false, score: 50 },
  { id: 12, sev: "low", cat: "standards", title: "MCP Protocol Adoption Accelerates Across Major AI Vendors", summary: "Anthropic, OpenAI, Google, Microsoft, AWS rally around Model Context Protocol for AI agent interoperability. Governance implications for agent oversight and tool access.", source: "MCP Blog", url: "https://modelcontextprotocol.io/", vendor: null, ts: "2025-12-12T16:00:00Z", isNew: false, score: 35 },
];

const FRAMEWORKS = [
  { name: "NIST AI RMF 2.0", status: "active", jur: "US", type: "Voluntary", updated: "2024-02", pillars: ["Govern","Map","Measure","Manage"] },
  { name: "EU AI Act", status: "enforcing", jur: "EU", type: "Mandatory", updated: "2024-08", pillars: ["Risk Classification","Transparency","Human Oversight","Conformity"] },
  { name: "ISO/IEC 42001", status: "active", jur: "Global", type: "Certifiable", updated: "2023-12", pillars: ["AIMS","Risk Treatment","Performance Eval"] },
  { name: "Colorado AI Act", status: "effective", jur: "US/State", type: "Mandatory", updated: "2026-02", pillars: ["Disclosure","Impact Assessment","High-Risk AI"] },
  { name: "California SB 53", status: "enacted", jur: "US/State", type: "Mandatory", updated: "2025-01", pillars: ["Safety Testing","Frontier Transparency"] },
  { name: "OECD AI Principles", status: "active", jur: "Global", type: "Voluntary", updated: "2024-05", pillars: ["Growth","Values","Transparency","Robustness","Accountability"] },
  { name: "Hiroshima Process", status: "active", jur: "G7", type: "Voluntary", updated: "2024-10", pillars: ["Guiding Principles","Code of Conduct"] },
  { name: "NYC LL 144", status: "in force", jur: "US/City", type: "Mandatory", updated: "2023-07", pillars: ["Bias Audits","Automated Hiring"] },
  { name: "NAIC Model Bulletin", status: "active", jur: "US/24 States", type: "Mandatory", updated: "2025-01", pillars: ["Governance","Bias Controls","Vendor Oversight","Audit Logs"] },
];

const TIMELINE = [
  { date: "2024-08", label: "EU AI Act enters force", type: "reg", past: true },
  { date: "2025-02", label: "EU prohibited practices apply", type: "reg", past: true },
  { date: "2025-07", label: "Anthropic $200M DoD contract", type: "vendor", past: true },
  { date: "2025-08", label: "EU GPAI rules + GPT-5 launch", type: "reg", past: true },
  { date: "2025-12", label: "Trump EO targets state AI laws", type: "reg", past: true },
  { date: "2026-01", label: "NIST GCR-26-069 + FLI Safety Index", type: "std", past: true },
  { date: "2026-02", label: "Colorado AI Act effective", type: "reg", past: true },
  { date: "2026-02", label: "Anthropic/DoD standoff + RSP replaced", type: "enforce", past: true },
  { date: "2026-08", label: "EU High-Risk AI (Annex III)", type: "reg", past: false },
  { date: "2027-08", label: "EU pre-2025 GPAI compliance", type: "reg", past: false },
];

const FEEDS = [
  // Government / Regulatory
  { name: "White House Presidential Actions", type: "RSS", freq: "6h", cat: "Regulatory" },
  { name: "Federal Register – AI Rules", type: "RSS", freq: "12h", cat: "Regulatory" },
  { name: "EU Digital Strategy", type: "RSS", freq: "12h", cat: "Regulatory" },
  { name: "EU AI Act Tracker", type: "RSS", freq: "12h", cat: "Regulatory" },
  { name: "EU AI Act Desk", type: "Scrape", freq: "12h", cat: "Regulatory" },
  { name: "UK DSIT – AI & Innovation", type: "RSS", freq: "12h", cat: "Regulatory" },
  { name: "UK AI Safety Institute", type: "RSS", freq: "6h", cat: "Safety" },
  { name: "CISA Advisories", type: "RSS", freq: "6h", cat: "Enforcement" },
  { name: "FedScoop", type: "RSS", freq: "12h", cat: "Regulatory" },
  { name: "StateScoop", type: "RSS", freq: "12h", cat: "Regulatory" },
  // Standards / Frameworks
  { name: "NIST AI", type: "RSS", freq: "12h", cat: "Standards" },
  { name: "OECD AI Policy", type: "RSS", freq: "12h", cat: "Frameworks" },
  { name: "IEEE Spectrum – AI", type: "RSS", freq: "12h", cat: "Standards" },
  { name: "Partnership on AI", type: "RSS", freq: "12h", cat: "Frameworks" },
  { name: "Responsible AI Institute", type: "RSS", freq: "24h", cat: "Frameworks" },
  { name: "Montreal AI Ethics Institute", type: "RSS", freq: "24h", cat: "Frameworks" },
  { name: "RAND Commentary", type: "RSS", freq: "24h", cat: "Frameworks" },
  { name: "AI Regulation", type: "RSS", freq: "24h", cat: "Regulatory" },
  { name: "CSA Research", type: "Scrape", freq: "24h", cat: "Frameworks" },
  // AI Safety Research
  { name: "Future of Life Institute", type: "RSS", freq: "12h", cat: "Safety" },
  { name: "Center for AI Safety", type: "Scrape", freq: "24h", cat: "Safety" },
  { name: "AI Now Institute", type: "RSS", freq: "24h", cat: "Safety" },
  { name: "AI Alignment Forum", type: "RSS", freq: "12h", cat: "Safety" },
  { name: "AI Incident Database", type: "RSS", freq: "12h", cat: "Enforcement" },
  { name: "Ada Lovelace Institute", type: "RSS", freq: "24h", cat: "Safety" },
  { name: "CSET Georgetown", type: "RSS", freq: "24h", cat: "Safety" },
  { name: "Data & Society", type: "RSS", freq: "24h", cat: "Safety" },
  { name: "AI as Normal Technology", type: "RSS", freq: "24h", cat: "Safety" },
  { name: "LessWrong", type: "RSS", freq: "12h", cat: "Safety" },
  // Enforcement / Civil Society
  { name: "Lawfare", type: "RSS", freq: "12h", cat: "Enforcement" },
  { name: "EPIC", type: "RSS", freq: "12h", cat: "Enforcement" },
  { name: "Electronic Frontier Foundation", type: "RSS", freq: "12h", cat: "Enforcement" },
  { name: "Access Now", type: "RSS", freq: "24h", cat: "Enforcement" },
  { name: "AlgorithmWatch", type: "RSS", freq: "24h", cat: "Enforcement" },
  { name: "Center for Democracy & Technology", type: "RSS", freq: "12h", cat: "Regulatory" },
  { name: "Future of Privacy Forum", type: "RSS", freq: "24h", cat: "Regulatory" },
  { name: "Hunton Privacy Blog", type: "RSS", freq: "24h", cat: "Regulatory" },
  { name: "AIAAIC Repository", type: "Scrape", freq: "24h", cat: "Enforcement" },
  // Vendor Blogs
  { name: "OpenAI News", type: "RSS", freq: "6h", cat: "Vendor" },
  { name: "Anthropic Research", type: "RSS", freq: "6h", cat: "Vendor" },
  { name: "Google DeepMind Blog", type: "RSS", freq: "12h", cat: "Vendor" },
  { name: "Google AI Blog", type: "RSS", freq: "12h", cat: "Vendor" },
  { name: "Microsoft On the Issues", type: "RSS", freq: "12h", cat: "Vendor" },
  { name: "Meta AI Blog", type: "Scrape", freq: "12h", cat: "Vendor" },
  // News & Analysis
  { name: "MIT Technology Review – AI", type: "RSS", freq: "12h", cat: "News" },
  { name: "MIT Technology Review – Policy", type: "RSS", freq: "12h", cat: "News" },
  { name: "TechCrunch – AI Policy", type: "RSS", freq: "6h", cat: "News" },
  { name: "Axios AI", type: "RSS", freq: "6h", cat: "News" },
  { name: "AI News", type: "RSS", freq: "12h", cat: "News" },
  { name: "Brookings AI", type: "RSS", freq: "12h", cat: "Frameworks" },
  { name: "LSE Media Blog", type: "RSS", freq: "24h", cat: "Frameworks" },
  { name: "Pew Research Center", type: "RSS", freq: "24h", cat: "Frameworks" },
];

const sevDistribution = [
  { name: "Critical", value: ALERTS.filter(a => a.sev === "critical").length, color: "#EF4444" },
  { name: "High", value: ALERTS.filter(a => a.sev === "high").length, color: "#F59E0B" },
  { name: "Medium", value: ALERTS.filter(a => a.sev === "medium").length, color: "#3B82F6" },
  { name: "Low", value: ALERTS.filter(a => a.sev === "low").length, color: "#10B981" },
];

const catDistribution = Object.entries(CATS).map(([k, v]) => ({
  name: v.label, value: ALERTS.filter(a => a.cat === k).length, color: v.color,
}));

const trendData = [
  { month: "Oct", critical: 1, high: 2, medium: 3 },
  { month: "Nov", critical: 1, high: 3, medium: 4 },
  { month: "Dec", critical: 2, high: 3, medium: 5 },
  { month: "Jan", critical: 2, high: 4, medium: 4 },
  { month: "Feb", critical: 3, high: 4, medium: 5 },
  { month: "Mar", critical: 3, high: 4, medium: 4 },
];

const ago = (ts: string) => {
  const ms = Date.now() - new Date(ts).getTime();
  const h = Math.floor(ms / 3.6e6);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(ms / 8.64e7);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const SevBadge = ({ sev, size = "sm" }: { sev: string; size?: string }) => {
  const s = SEV[sev];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, padding: size === "lg" ? "4px 12px" : "2px 8px", borderRadius: 4,
      fontSize: size === "lg" ? 11 : 10, fontWeight: 700, fontFamily: "var(--mono)",
      letterSpacing: "0.04em", lineHeight: 1,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color,
        boxShadow: sev === "critical" ? `0 0 8px ${s.color}` : "none",
        animation: sev === "critical" ? "pulse 2s infinite" : "none",
      }} />
      {s.label}
    </span>
  );
};

const Metric = ({ label, value, sub, accent, icon: Icon, trend, onClick }: { label: string; value: number | string; sub?: string; accent?: string; icon?: any; trend?: string; onClick?: () => void }) => (
  <div className="ao-card" onClick={onClick} style={{ padding: "20px 22px", flex: 1, minWidth: 170, cursor: onClick ? "pointer" : "default", transition: "border-color 0.2s, transform 0.15s, background 0.2s" }}
    onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.3)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; } }}
    onMouseLeave={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.borderColor = ""; (e.currentTarget as HTMLDivElement).style.transform = ""; } }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
      <span className="ao-label">{label}</span>
      {Icon && <Icon size={15} style={{ color: onClick ? accent || "var(--accent)" : "var(--text-3)", opacity: onClick ? 0.7 : 0.5 }} />}
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, color: accent || "var(--text-0)", fontFamily: "var(--display)", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
    {sub && (
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
        {trend === "up" && <ArrowUpRight size={12} style={{ color: "#EF4444" }} />}
        {trend === "down" && <ArrowDownRight size={12} style={{ color: "#10B981" }} />}
        <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)" }}>{sub}</span>
        {onClick && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--accent)", fontFamily: "var(--mono)", opacity: 0.6 }}>view →</span>}
      </div>
    )}
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick, badge }: { icon: any; label: string; active: boolean; onClick: () => void; badge: number }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer",
    background: active ? "var(--surface-active)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-2)",
    fontFamily: "var(--body)", fontSize: 13, fontWeight: active ? 600 : 450,
    transition: "all 0.15s ease",
  }}>
    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
    <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
    {badge > 0 && (
      <span style={{ background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, fontFamily: "var(--mono)", minWidth: 18, textAlign: "center", lineHeight: "16px" }}>{badge}</span>
    )}
  </button>
);

const ChartTooltipContent = ({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "var(--mono)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      <div style={{ color: "var(--text-2)", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: p.color }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Page() {
  const [view, setView] = useState("command");
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = ALERTS.filter(a => {
    if (sevFilter !== "all" && a.sev !== sevFilter) return false;
    if (catFilter !== "all" && a.cat !== catFilter) return false;
    if (showNew && !a.isNew) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  const critCount = ALERTS.filter(a => a.sev === "critical").length;
  const newCount = ALERTS.filter(a => a.isNew).length;

  const nav = [
    { id: "command", icon: Activity, label: "Command Center", badge: critCount },
    { id: "alerts", icon: Bell, label: "Intelligence Feed", badge: newCount },
    { id: "vendors", icon: Cpu, label: "Vendor Matrix", badge: 0 },
    { id: "frameworks", icon: Layers, label: "Frameworks", badge: 0 },
    { id: "timeline", icon: Clock, label: "Timeline", badge: 0 },
    { id: "sources", icon: Database, label: "Data Sources", badge: 0 },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--text-1)", fontFamily: "var(--body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        :root {
          --bg: #09090B; --surface-0: #0F0F12; --surface-1: rgba(255,255,255,0.025);
          --surface-2: #18181B; --surface-active: rgba(56,189,248,0.08);
          --border: rgba(255,255,255,0.06); --border-hover: rgba(255,255,255,0.12);
          --accent: #38BDF8; --accent-dim: rgba(56,189,248,0.15);
          --text-0: #FAFAFA; --text-1: #D4D4D8; --text-2: #A1A1AA; --text-3: #71717A;
          --display: 'DM Sans', sans-serif; --body: 'DM Sans', sans-serif;
          --mono: 'IBM Plex Mono', monospace; --radius: 10px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .ao-card { background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--radius); transition: border-color 0.2s, background 0.2s; }
        .ao-card:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.035); }
        .ao-label { font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
        .ao-section-title { font-family: var(--display); font-size: 13px; font-weight: 700; color: var(--text-2); letter-spacing: -0.01em; }
        .ao-enter { animation: fadeUp 0.4s ease both; }
        .ao-enter-1 { animation-delay: 0.05s; } .ao-enter-2 { animation-delay: 0.1s; }
        .ao-enter-3 { animation-delay: 0.15s; } .ao-enter-4 { animation-delay: 0.2s; }
        .ao-alert-row { padding: 16px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
        .ao-alert-row:hover { background: rgba(255,255,255,0.02); }
        .ao-alert-row:last-child { border-bottom: none; }
        .ao-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-family: var(--mono); font-size: 10px; font-weight: 600; background: var(--surface-1); border: 1px solid var(--border); color: var(--text-2); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .ao-pill:hover { border-color: var(--border-hover); }
        .ao-pill.active { background: var(--accent-dim); border-color: rgba(56,189,248,0.25); color: var(--accent); }
        .ao-input { background: var(--surface-1); border: 1px solid var(--border); border-radius: 8px; color: var(--text-1); font-family: var(--body); font-size: 13px; padding: 9px 14px 9px 36px; outline: none; transition: border-color 0.2s; width: 100%; }
        .ao-input:focus { border-color: rgba(56,189,248,0.35); }
        .ao-input::placeholder { color: var(--text-3); }
        .ao-fw-grid { display: grid; grid-template-columns: 2.2fr 1fr 0.8fr 1fr 0.7fr 2fr; gap: 12px; padding: 14px 20px; align-items: center; font-size: 13px; }
        .ao-vendor-bar { height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
        .ao-vendor-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
        .ao-source-link { display: inline-flex; align-items: center; gap: 4px; color: var(--text-3); text-decoration: none; transition: color 0.15s; }
        .ao-source-link:hover { color: var(--accent); }
        .ao-title-link { font-weight: 600; color: var(--accent); text-decoration: underline; text-decoration-color: rgba(56,189,248,0.25); text-underline-offset: 3px; transition: color 0.15s, text-decoration-color 0.15s; line-height: 1.4; cursor: pointer; }
        .ao-title-link:hover { color: #7DD3FC; text-decoration-color: rgba(125,211,252,0.5); }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .ao-noise { position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.015; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
      `}</style>
      <div className="ao-noise" />

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "0 12px", background: "var(--surface-0)" }}>
        <div style={{ padding: "20px 14px 24px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src="/logo.png" alt="AI Governance Observatory" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 14, color: "var(--text-0)", letterSpacing: "-0.02em" }}>Governance</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Observatory v2.0</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "8px 14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)" }}>
            <Radio size={10} style={{ color: "#10B981", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#10B981" }}>LIVE</span>
            <span style={{ marginLeft: "auto" }}>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {nav.map(n => <NavItem key={n.id} {...n} active={view === n.id} onClick={() => setView(n.id)} />)}
        </nav>
        <div style={{ padding: "16px 14px", borderTop: "1px solid var(--border)", fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", lineHeight: 1.6 }}>
          {FEEDS.length} sources active<br/>Next sync: {new Date(Date.now() + 3600000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 36px", background: `radial-gradient(ellipse at 15% 0%, rgba(56,189,248,0.03) 0%, transparent 45%), radial-gradient(ellipse at 85% 100%, rgba(239,68,68,0.02) 0%, transparent 45%), var(--bg)` }}>

        {/* COMMAND CENTER */}
        {view === "command" && mounted && (<div>
          <div className="ao-enter" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>Command Center</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>AI governance intelligence across {VENDORS_DATA.length} vendors, {FRAMEWORKS.length} frameworks, and {FEEDS.length} data sources.</p>
          </div>
          <div className="ao-enter ao-enter-1" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <Metric label="Active Alerts" value={ALERTS.length} sub="across all categories" icon={Bell} accent="var(--accent)" onClick={() => { setSevFilter("all"); setCatFilter("all"); setShowNew(false); setView("alerts"); }} />
            <Metric label="Critical" value={critCount} sub="+2 this week" icon={AlertTriangle} accent="#EF4444" trend="up" onClick={() => { setSevFilter("critical"); setCatFilter("all"); setShowNew(false); setView("alerts"); }} />
            <Metric label="High Priority" value={ALERTS.filter(a=>a.sev==="high").length} sub="requires attention" icon={Zap} accent="#F59E0B" onClick={() => { setSevFilter("high"); setCatFilter("all"); setShowNew(false); setView("alerts"); }} />
            <Metric label="New Items" value={newCount} sub="since last review" icon={Radio} accent="#8B5CF6" onClick={() => { setSevFilter("all"); setCatFilter("all"); setShowNew(true); setView("alerts"); }} />
            <Metric label="Frameworks" value={FRAMEWORKS.length} sub="tracked globally" icon={Layers} accent="var(--text-2)" onClick={() => setView("frameworks")} />
          </div>
          {critCount > 0 && (<div className="ao-enter ao-enter-2" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "var(--radius)", padding: 22, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <AlertTriangle size={14} style={{ color: "#EF4444" }} />
              <span className="ao-label" style={{ color: "#EF4444", letterSpacing: "0.1em" }}>EXECUTIVE PRIORITY ALERTS</span>
            </div>
            {ALERTS.filter(a => a.sev === "critical").map((a, i) => (
              <div key={a.id} style={{ padding: "14px 16px", marginBottom: i < critCount - 1 ? 10 : 0, background: "rgba(0,0,0,0.25)", borderRadius: 8, borderLeft: "3px solid #EF4444" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <SevBadge sev="critical" />
                  {a.isNew && <span style={{ background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "var(--mono)", animation: "pulse 2s infinite" }}>NEW</span>}
                  {a.vendor && <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: VENDORS_DATA.find(v=>v.name===a.vendor)?.color }}>{a.vendor}</span>}
                  <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", marginLeft: "auto" }}>{ago(a.ts)}</span>
                </div>
                {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="ao-title-link" style={{ fontSize: 14, display: "block", marginBottom: 6 }}>{a.title} <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle", opacity: 0.8 }} /></a> : <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-0)", marginBottom: 6, lineHeight: 1.4 }}>{a.title}</div>}
                <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55 }}>{a.summary}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", marginTop: 10 }}>
                  <span>{a.source} · Score: {a.score}/100</span>
                  {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--accent)", textDecoration: "none", fontWeight: 600, fontSize: 11, marginLeft: "auto", padding: "4px 10px", borderRadius: 5, border: "1px solid rgba(56,189,248,0.2)", transition: "all 0.15s", background: "rgba(56,189,248,0.05)" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.12)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,0.05)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)"; }}>Read article <ExternalLink size={10} /></a>}
                </div>
              </div>
            ))}
          </div>)}
          <div className="ao-enter ao-enter-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="ao-card" style={{ padding: 20 }}>
              <div className="ao-label" style={{ marginBottom: 14 }}>Severity Distribution</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={sevDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                  {sevDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip content={<ChartTooltipContent />} /></PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                {sevDistribution.map(s => (<div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.name} ({s.value})</div>))}
              </div>
            </div>
            <div className="ao-card" style={{ padding: 20 }}>
              <div className="ao-label" style={{ marginBottom: 14 }}>Alert Trend (6 Months)</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="critG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.3}/><stop offset="100%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                    <linearGradient id="highG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2}/><stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#71717A", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="critical" stroke="#EF4444" fill="url(#critG)" strokeWidth={2} name="Critical" />
                  <Area type="monotone" dataKey="high" stroke="#F59E0B" fill="url(#highG)" strokeWidth={2} name="High" />
                  <Area type="monotone" dataKey="medium" stroke="#3B82F6" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Medium" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="ao-card" style={{ padding: 20 }}>
              <div className="ao-label" style={{ marginBottom: 14 }}>By Category</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={catDistribution} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Alerts">{catDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="ao-enter ao-enter-4" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <div className="ao-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="ao-section-title">Priority Feed</span><span className="ao-label">Score &gt; 50</span>
              </div>
              {ALERTS.filter(a => a.score > 50).sort((a,b) => b.score - a.score).slice(0, 6).map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: SEV[a.sev].bg, border: `1px solid ${SEV[a.sev].border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, color: SEV[a.sev].color, flexShrink: 0 }}>{a.score}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#38BDF8")} onMouseLeave={e => (e.currentTarget.style.color = "var(--text-0)")}>{a.title}</a> : <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}><SevBadge sev={a.sev} /><span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)" }}>{ago(a.ts)}</span></div>
                  </div>
                  {a.isNew && <span style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "var(--mono)" }}>NEW</span>}
                </div>
              ))}
            </div>
            <div className="ao-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="ao-section-title">Vendor Guardrail Strength</span><span className="ao-label">0 to 100</span>
              </div>
              {VENDORS_DATA.map(v => (
                <div key={v.name} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, boxShadow: `0 0 6px ${v.color}40` }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>{v.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--mono)", color: v.guardrails >= 70 ? "#10B981" : v.guardrails >= 50 ? "#F59E0B" : "#EF4444" }}>{v.guardrails}</span>
                      <SevBadge sev={v.risk} />
                    </div>
                  </div>
                  <div className="ao-vendor-bar"><div className="ao-vendor-fill" style={{ width: `${v.guardrails}%`, background: `linear-gradient(90deg, ${v.color}80, ${v.color})` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>)}

        {/* INTELLIGENCE FEED */}
        {view === "alerts" && mounted && (<div>
          <div className="ao-enter" style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>Intelligence Feed</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>All governance intelligence items, scored and classified by the ingestion engine.</p>
          </div>
          <div className="ao-enter ao-enter-1" style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "0 0 280px" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input className="ao-input" placeholder="Search alerts..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
            </div>
            <select value={sevFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSevFilter(e.target.value)} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-1)", fontFamily: "var(--mono)", fontSize: 12, padding: "9px 12px", outline: "none" }}>
              <option value="all">All Severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
            <select value={catFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCatFilter(e.target.value)} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-1)", fontFamily: "var(--mono)", fontSize: 12, padding: "9px 12px", outline: "none" }}>
              <option value="all">All Categories</option>{Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button className={`ao-pill ${showNew ? "active" : ""}`} onClick={() => setShowNew(!showNew)} style={{ padding: "8px 14px" }}><Radio size={10} /> New Only</button>
            <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", marginLeft: "auto" }}>{filtered.length} of {ALERTS.length}</span>
          </div>
          <div className="ao-card ao-enter ao-enter-2" style={{ overflow: "hidden" }}>
            {filtered.map(a => {
              const CatIcon = CATS[a.cat]?.icon || Info;
              const isOpen = expanded === a.id;
              return (
                <div key={a.id} className="ao-alert-row" onClick={() => setExpanded(isOpen ? null : a.id)} style={{ borderLeft: `3px solid ${SEV[a.sev].color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isOpen ? 10 : 0, flexWrap: "wrap" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: SEV[a.sev].bg, border: `1px solid ${SEV[a.sev].border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, color: SEV[a.sev].color, flexShrink: 0 }}>{a.score}</div>
                    <SevBadge sev={a.sev} />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "var(--mono)", color: CATS[a.cat]?.color, background: `${CATS[a.cat]?.color}10`, padding: "2px 8px", borderRadius: 4 }}><CatIcon size={10} /> {CATS[a.cat]?.label}</span>
                    {a.vendor && <span style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, color: VENDORS_DATA.find(v=>v.name===a.vendor)?.color }}>{a.vendor}</span>}
                    {a.isNew && <span style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "var(--mono)" }}>NEW</span>}
                    <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", marginLeft: "auto" }}>{ago(a.ts)}</span>
                    <ChevronDown size={14} style={{ color: "var(--text-3)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </div>
                  {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="ao-title-link" style={{ fontSize: 14, display: "block" }} onClick={e => e.stopPropagation()}>{a.title} <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle", opacity: 0.8 }} /></a> : <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-0)", lineHeight: 1.4 }}>{a.title}</div>}
                  {isOpen && (<div style={{ animation: "fadeUp 0.2s ease" }}>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginTop: 8, marginBottom: 12 }}>{a.summary}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)" }}>
                      {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="ao-source-link" onClick={e => e.stopPropagation()}><ExternalLink size={9} /> {a.source}</a> : <span>Source: {a.source}</span>}
                      <span>Score: {a.score}/100</span>
                      <span>{new Date(a.ts).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>)}
                </div>
              );
            })}
          </div>
        </div>)}

        {/* VENDOR MATRIX */}
        {view === "vendors" && mounted && (<div>
          <div className="ao-enter" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>Vendor Matrix</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Guardrail posture across frontier AI providers.</p>
          </div>
          <div className="ao-enter ao-enter-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="ao-card" style={{ padding: 20 }}>
              <div className="ao-label" style={{ marginBottom: 12 }}>Transparency vs. Guardrail Strength</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={VENDORS_DATA} barSize={18}>
                  <XAxis dataKey="name" tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0,100]} width={30} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="transparency" name="Transparency" fill="#3B82F6" radius={[3,3,0,0]} />
                  <Bar dataKey="guardrails" name="Guardrails" fill="#10B981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#3B82F6" }} /> Transparency</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#10B981" }} /> Guardrails</span>
              </div>
            </div>
            <div className="ao-card" style={{ padding: 20 }}>
              <div className="ao-label" style={{ marginBottom: 12 }}>Military AI Posture</div>
              {VENDORS_DATA.map(v => (
                <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)", width: 90 }}>{v.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, color: v.military === "Restricted" ? "#10B981" : v.military === "Unrestricted" ? "#EF4444" : "#F59E0B" }}>
                    {v.military === "Restricted" ? <Lock size={11} /> : <Unlock size={11} />}{v.military}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", marginLeft: "auto" }}>{v.lastChange}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ao-enter ao-enter-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {VENDORS_DATA.map(v => (
              <div key={v.name} className="ao-card" style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.color, boxShadow: `0 0 8px ${v.color}50` }} />
                    <div><div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-0)", fontFamily: "var(--display)" }}>{v.name}</div><div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", marginTop: 1 }}>{v.models}</div></div>
                  </div>
                  <SevBadge sev={v.risk} size="lg" />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 14 }}><strong style={{ color: "var(--text-1)" }}>Safety:</strong> {v.safety}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Transparency</div><div className="ao-vendor-bar"><div className="ao-vendor-fill" style={{ width: `${v.transparency}%`, background: "#3B82F6" }} /></div><div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "#3B82F6", marginTop: 3 }}>{v.transparency}/100</div></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Guardrails</div><div className="ao-vendor-bar"><div className="ao-vendor-fill" style={{ width: `${v.guardrails}%`, background: "#10B981" }} /></div><div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "#10B981", marginTop: 3 }}>{v.guardrails}/100</div></div>
                </div>
                <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)" }}>Updated: {v.lastChange}</div>
              </div>
            ))}
          </div>
        </div>)}

        {/* FRAMEWORKS */}
        {view === "frameworks" && mounted && (<div>
          <div className="ao-enter" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>Governance Frameworks</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Active regulatory frameworks, standards, and compliance requirements tracked globally.</p>
          </div>
          <div className="ao-card ao-enter ao-enter-1" style={{ overflow: "hidden" }}>
            <div className="ao-fw-grid" style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
              <span className="ao-label">Framework</span><span className="ao-label">Status</span><span className="ao-label">Jurisdiction</span><span className="ao-label">Type</span><span className="ao-label">Updated</span><span className="ao-label">Key Pillars</span>
            </div>
            {FRAMEWORKS.map(fw => (
              <div key={fw.name} className="ao-fw-grid" style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s", cursor: "default" }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }} onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "transparent"; }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-0)" }}>{fw.name}</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                  background: fw.status === "active" || fw.status === "in force" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                  color: fw.status === "active" || fw.status === "in force" ? "#10B981" : "#F59E0B",
                }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />{fw.status.toUpperCase()}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text-2)" }}>{fw.jur}</span>
                <span style={{ fontSize: 11, fontWeight: fw.type === "Mandatory" ? 700 : 400, color: fw.type === "Mandatory" ? "#F59E0B" : "var(--text-2)" }}>{fw.type}</span>
                <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)" }}>{fw.updated}</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {fw.pillars.map(p => (<span key={p} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-2)" }}>{p}</span>))}
                </div>
              </div>
            ))}
          </div>
        </div>)}

        {/* TIMELINE */}
        {view === "timeline" && mounted && (<div>
          <div className="ao-enter" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>Regulatory Timeline</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Key milestones in AI governance, safety policy, and enforcement.</p>
          </div>
          <div className="ao-enter ao-enter-1" style={{ position: "relative", paddingLeft: 48 }}>
            <div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, var(--accent), rgba(239,68,68,0.3), transparent)" }} />
            {TIMELINE.map((ev, i) => {
              const tc = ({ reg: { color: "#F59E0B", icon: Scale }, vendor: { color: "#8B5CF6", icon: Cpu }, std: { color: "#10B981", icon: FileText }, enforce: { color: "#EF4444", icon: AlertCircle } } as Record<string, { color: string; icon: any }>)[ev.type] || { color: "var(--text-3)", icon: Info };
              const EvIcon = tc.icon;
              return (
                <div key={i} style={{ position: "relative", marginBottom: 32, opacity: ev.past ? 0.65 : 1, animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                  <div style={{ position: "absolute", left: -37, top: 2, width: 28, height: 28, borderRadius: 8,
                    background: ev.past ? "var(--surface-2)" : `${tc.color}15`, border: `1.5px solid ${ev.past ? "var(--border)" : tc.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ev.past ? "none" : `0 0 16px ${tc.color}25` }}>
                    <EvIcon size={12} style={{ color: ev.past ? "var(--text-3)" : tc.color }} />
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", marginBottom: 4 }}>
                    {ev.date}{!ev.past && <span style={{ marginLeft: 8, color: tc.color, fontWeight: 700, letterSpacing: "0.05em" }}>UPCOMING</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: ev.past ? "var(--text-2)" : "var(--text-0)", lineHeight: 1.4 }}>{ev.label}</div>
                </div>
              );
            })}
          </div>
        </div>)}

        {/* DATA SOURCES */}
        {view === "sources" && mounted && (<div>
          <div className="ao-enter" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>Data Sources</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>All feeds use RSS or web scraping. Zero API costs. Vercel Cron refreshes at 06:00 and 18:00 UTC.</p>
          </div>
          <div className="ao-enter ao-enter-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {FEEDS.map(f => (
              <div key={f.name} className="ao-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-0)", marginBottom: 2 }}>{f.name}</div><span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)" }}>{f.cat}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)" }}>{f.freq}</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                    background: f.type === "RSS" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                    color: f.type === "RSS" ? "#10B981" : "#F59E0B",
                    border: `1px solid ${f.type === "RSS" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                  }}>{f.type}</span>
                  <Radio size={8} style={{ color: "#10B981", animation: "pulse 2.5s infinite" }} />
                </div>
              </div>
            ))}
          </div>
        </div>)}
      </main>
    </div>
  );
}
