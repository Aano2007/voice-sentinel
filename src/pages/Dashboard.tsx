import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/dashboard/Navbar";
import {
  Activity, FileAudio, BarChart3, Shield,
  Users, Radar, PieChart, Clock,
} from "lucide-react";
import { RealTimeAnalysis } from "@/components/dashboard/tabs/RealTimeAnalysis";
import { FileAnalysis }     from "@/components/dashboard/tabs/FileAnalysis";
import { VoiceAnalytics }   from "@/components/dashboard/tabs/VoiceAnalytics";
import { SecurityLogs }     from "@/components/dashboard/tabs/SecurityLogs";
import { VoiceCompare }     from "@/components/dashboard/tabs/VoiceCompare";
import { ThreatRadar }      from "@/components/dashboard/tabs/ThreatRadar";
import { StatisticsDashboard } from "@/components/dashboard/tabs/StatisticsDashboard";

type TabType = "realtime" | "file" | "compare" | "logs" | "radar" | "analytics" | "statistics";

const NAV_GROUPS = [
  {
    label: "Analysis",
    items: [
      { id: "realtime"   as TabType, label: "Real-time Analysis", icon: Activity  },
      { id: "file"       as TabType, label: "File Analysis",       icon: FileAudio },
      { id: "compare"    as TabType, label: "Voice Compare",       icon: Users     },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { id: "logs"  as TabType, label: "Security Logs", icon: Shield },
      { id: "radar" as TabType, label: "Threat Radar",  icon: Radar  },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics"  as TabType, label: "Voice Analytics", icon: BarChart3 },
      { id: "statistics" as TabType, label: "Statistics",       icon: PieChart  },
    ],
  },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  realtime:   <RealTimeAnalysis />,
  file:       <FileAnalysis />,
  compare:    <VoiceCompare />,
  logs:       <SecurityLogs />,
  radar:      <ThreatRadar />,
  analytics:  <VoiceAnalytics />,
  statistics: <StatisticsDashboard />,
};

const TAB_LABELS: Record<TabType, string> = {
  realtime:   "Real-time Analysis",
  file:       "File Analysis",
  compare:    "Voice Compare",
  logs:       "Security Logs",
  radar:      "Threat Radar",
  analytics:  "Voice Analytics",
  statistics: "Statistics",
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("realtime");
  const lastScan = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background" style={{ background: "#0b0d14" }}>
      <Navbar />

      <div className="flex">
        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-60 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] flex flex-col overflow-y-auto"
          style={{ background: "rgba(13,16,24,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Status pill */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}>
              <motion.span className="w-2 h-2 rounded-full bg-green-400 shrink-0" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="font-mono text-[11px] text-green-400 uppercase tracking-widest">System Active</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 px-1">
              <Clock className="w-3 h-3 text-white/20" />
              <span className="font-mono text-[10px] text-white/25">Last scan: {lastScan}</span>
            </div>
          </div>

          <div className="px-3 pb-6 space-y-6 mt-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 px-3 mb-2">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                      <motion.button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-[13px] transition-all duration-150 text-left"
                        style={active ? {
                          background: "rgba(129,140,248,0.1)",
                          color: "#a5b4fc",
                          borderLeft: "2px solid #818cf8",
                          boxShadow: "inset 0 0 20px rgba(129,140,248,0.05)",
                        } : {
                          color: "rgba(255,255,255,0.35)",
                          borderLeft: "2px solid transparent",
                        }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 p-7">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-[11px] text-white/20 uppercase tracking-widest">Dashboard</span>
            <span className="text-white/15 text-xs">/</span>
            <span className="font-mono text-[11px] text-[#818cf8] uppercase tracking-widest">{TAB_LABELS[activeTab]}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {TAB_CONTENT[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
