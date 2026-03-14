import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/dashboard/Navbar";
import {
  Activity,
  FileAudio,
  BarChart3,
  Shield,
  Users,
  Radar,
  PieChart,
} from "lucide-react";
import { RealTimeAnalysis } from "@/components/dashboard/tabs/RealTimeAnalysis";
import { FileAnalysis } from "@/components/dashboard/tabs/FileAnalysis";
import { VoiceAnalytics } from "@/components/dashboard/tabs/VoiceAnalytics";
import { SecurityLogs } from "@/components/dashboard/tabs/SecurityLogs";
import { VoiceCompare } from "@/components/dashboard/tabs/VoiceCompare";
import { ThreatRadar } from "@/components/dashboard/tabs/ThreatRadar";
import { StatisticsDashboard } from "@/components/dashboard/tabs/StatisticsDashboard";

type TabType =
  | "realtime"
  | "file"
  | "analytics"
  | "logs"
  | "compare"
  | "radar"
  | "statistics";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("realtime");

  const tabs = [
    { id: "realtime" as TabType, label: "Real-time Analysis", icon: Activity },
    { id: "file" as TabType, label: "File Analysis", icon: FileAudio },
    { id: "analytics" as TabType, label: "Voice Analytics", icon: BarChart3 },
    { id: "logs" as TabType, label: "Security Logs", icon: Shield },
    { id: "compare" as TabType, label: "Voice Compare", icon: Users },
    { id: "radar" as TabType, label: "Threat Radar", icon: Radar },
    { id: "statistics" as TabType, label: "Statistics", icon: PieChart },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "realtime":
        return <RealTimeAnalysis />;
      case "file":
        return <FileAnalysis />;
      case "analytics":
        return <VoiceAnalytics />;
      case "logs":
        return <SecurityLogs />;
      case "compare":
        return <VoiceCompare />;
      case "radar":
        return <ThreatRadar />;
      case "statistics":
        return <StatisticsDashboard />;
      default:
        return <RealTimeAnalysis />;
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 border-r border-border bg-card/50 backdrop-blur-xl min-h-[calc(100vh-57px)] sticky top-[57px]"
        >
          <div className="p-4">
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 px-3">
              Navigation
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
