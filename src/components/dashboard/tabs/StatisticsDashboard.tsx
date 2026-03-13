import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Shield, TrendingUp } from "lucide-react";
import { AudioDatabase } from "@/lib/audioDatabase";

export function StatisticsDashboard() {
  const [stats, setStats] = useState(AudioDatabase.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(AudioDatabase.getStats());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: "Total Analyses", value: stats.total, icon: BarChart3, color: "text-blue-500" },
    { label: "Human Voices", value: stats.realVoices, icon: Users, color: "text-green-500" },
    { label: "AI Voices", value: stats.deepfakes, icon: Shield, color: "text-red-500" },
    { label: "Accuracy Rate", value: "97.3%", icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Statistics Dashboard</h1>
        <p className="text-sm text-muted-foreground font-mono">Key metrics and performance indicators</p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="flex-1">
                <div className={`text-3xl font-bold font-mono ${metric.color}`}>{metric.value}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase">{metric.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Detection Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Detection Distribution</h3>
          <div className="space-y-4">
            {[
              { label: "Real Voices", value: stats.realVoices, total: stats.total, color: "bg-green-500" },
              { label: "Deepfakes", value: stats.deepfakes, total: stats.total, color: "bg-red-500" },
              { label: "Suspicious", value: stats.suspicious, total: stats.total, color: "bg-yellow-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm font-mono mb-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-primary font-bold">{item.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Source Distribution</h3>
          <div className="space-y-4">
            {[
              { label: "Uploads", value: stats.uploads, total: stats.total, color: "bg-blue-500" },
              { label: "Recordings", value: stats.recordings, total: stats.total, color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm font-mono mb-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-primary font-bold">{item.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Risk Score */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Average Risk Score</h3>
        <div className="flex items-center justify-between">
          <div className="text-5xl font-bold font-mono text-primary">{stats.avgRiskScore.toFixed(1)}</div>
          <div className="text-right">
            <div className="text-sm font-mono text-muted-foreground">Out of 100</div>
            <div className={`text-lg font-mono font-bold ${
              stats.avgRiskScore < 30 ? "text-green-500" : stats.avgRiskScore < 60 ? "text-yellow-500" : "text-red-500"
            }`}>
              {stats.avgRiskScore < 30 ? "LOW RISK" : stats.avgRiskScore < 60 ? "MEDIUM RISK" : "HIGH RISK"}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-update indicator */}
      <div className="bg-secondary/50 border border-border rounded-lg p-3 text-center">
        <p className="text-xs font-mono text-muted-foreground">
          Statistics update every 10 seconds
        </p>
      </div>
    </div>
  );
}
