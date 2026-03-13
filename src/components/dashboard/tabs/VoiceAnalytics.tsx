import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { AudioDatabase } from "@/lib/audioDatabase";

export function VoiceAnalytics() {
  const [historyData, setHistoryData] = useState<number[]>([]);
  const [detectionTrends, setDetectionTrends] = useState<number[]>([]);
  const [energyData, setEnergyData] = useState<number[]>([]);

  useEffect(() => {
    // Generate sample data
    setHistoryData(Array.from({ length: 20 }, () => Math.random() * 100));
    setDetectionTrends(Array.from({ length: 20 }, () => Math.random() * 100));
    setEnergyData(Array.from({ length: 20 }, () => Math.random() * 100));

    const interval = setInterval(() => {
      setHistoryData((prev) => [...prev.slice(1), Math.random() * 100]);
      setDetectionTrends((prev) => [...prev.slice(1), Math.random() * 100]);
      setEnergyData((prev) => [...prev.slice(1), Math.random() * 100]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stats = AudioDatabase.getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Voice Analytics</h1>
        <p className="text-sm text-muted-foreground font-mono">Historical analysis and trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Analyses", value: stats.total, icon: BarChart3 },
          { label: "Deepfakes Detected", value: stats.deepfakes, icon: TrendingUp },
          { label: "Avg Risk Score", value: stats.avgRiskScore.toFixed(1), icon: Activity },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Voice Metrics History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Voice Metrics History</h3>
        <div className="h-48 flex items-end gap-2">
          {historyData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
              animate={{ height: `${value}%` }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>

      {/* Detection Trends */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Deepfake Detection Trends</h3>
        <div className="h-48 flex items-end gap-2">
          {detectionTrends.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-red-500 to-orange-500 rounded-t"
              animate={{ height: `${value}%` }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>

      {/* Audio Energy */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Audio Energy Graphs</h3>
        <div className="h-48 flex items-end gap-2">
          {energyData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-green-500 to-teal-500 rounded-t"
              animate={{ height: `${value}%` }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
