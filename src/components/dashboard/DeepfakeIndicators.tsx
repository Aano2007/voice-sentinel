import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DeepfakeIndicator } from "@/lib/audioAnalysis";

interface Props {
  indicators: DeepfakeIndicator[] | null;
}

export function DeepfakeIndicators({ indicators }: Props) {
  if (!indicators) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
        Deepfake Indicators
      </h4>
      <div className="space-y-2">
        {indicators.map((ind, i) => {
          const Icon = ind.detected ? (ind.severity === "high" ? XCircle : AlertTriangle) : CheckCircle2;
          const colorClass = ind.detected
            ? ind.severity === "high"
              ? "text-danger"
              : "text-warning"
            : "text-success";
          return (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-2 rounded bg-secondary/30"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colorClass}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-foreground">{ind.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                      ind.detected
                        ? ind.severity === "high"
                          ? "bg-danger/20 text-danger"
                          : "bg-warning/20 text-warning"
                        : "bg-success/20 text-success"
                    }`}
                  >
                    {ind.detected ? ind.severity : "clear"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ind.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
