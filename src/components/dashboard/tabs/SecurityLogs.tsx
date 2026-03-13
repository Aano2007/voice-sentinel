import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AudioDatabase } from "@/lib/audioDatabase";

export function SecurityLogs() {
  const records = AudioDatabase.getAll();

  const getIcon = (label: string) => {
    switch (label) {
      case "Real Voice":
        return CheckCircle2;
      case "Deepfake Detected":
        return XCircle;
      case "Suspicious":
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const getColor = (label: string) => {
    switch (label) {
      case "Real Voice":
        return "text-green-500";
      case "Deepfake Detected":
        return "text-red-500";
      case "Suspicious":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getThreatLevel = (riskScore: number) => {
    if (riskScore < 30) return { label: "LOW", color: "text-green-500" };
    if (riskScore < 60) return { label: "MEDIUM", color: "text-yellow-500" };
    return { label: "HIGH", color: "text-red-500" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Security Logs</h1>
        <p className="text-sm text-muted-foreground font-mono">Audit trail of all audio analyses</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Result</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Threat Level</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-mono">
                    No security logs available
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const Icon = getIcon(record.result.label);
                  const threat = getThreatLevel(record.result.riskScore);
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-mono">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{record.fileName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${getColor(record.result.label)}`} />
                          <span className={`text-sm font-mono font-semibold ${getColor(record.result.label)}`}>
                            {record.result.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-mono font-bold ${threat.color}`}>{threat.label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{record.result.confidence.toFixed(1)}%</td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
