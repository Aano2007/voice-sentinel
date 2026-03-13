import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import type { DetectionResult as DetectionResultType } from "@/lib/audioAnalysis";

interface Props {
  result: DetectionResultType | null;
  isAnalyzing: boolean;
}

export function DetectionResultCard({ result, isAnalyzing }: Props) {
  if (isAnalyzing) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <motion.div
          className="w-16 h-16 mx-auto rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-sm font-mono text-primary text-glow">Analyzing audio pattern...</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          Extracting MFCC • Spectral Analysis • AI Classification
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground font-mono">Awaiting audio input...</p>
        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
          Upload or record audio to begin analysis
        </p>
      </div>
    );
  }

  const isReal = result.label === "Real Voice";
  const isDeepfake = result.label === "Deepfake Detected";
  const Icon = isReal ? ShieldCheck : isDeepfake ? ShieldAlert : AlertTriangle;
  const colorClass = isReal ? "text-success" : isDeepfake ? "text-danger" : "text-warning";
  const bgClass = isReal ? "bg-success/10 border-success/30" : isDeepfake ? "bg-danger/10 border-danger/30" : "bg-warning/10 border-warning/30";
  const glowClass = isReal ? "glow-primary" : isDeepfake ? "glow-danger" : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg border p-6 ${bgClass} ${glowClass}`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Icon className={`w-12 h-12 ${colorClass}`} />
        </motion.div>
        <div className="flex-1">
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xl font-bold font-mono ${colorClass}`}
          >
            {result.label.toUpperCase()}
          </motion.h3>
          <div className="flex items-baseline gap-4 mt-1">
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase">Confidence</span>
              <p className="text-2xl font-bold font-mono text-foreground">{result.confidence}%</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase">Risk Score</span>
              <p className="text-2xl font-bold font-mono text-foreground">{result.riskScore}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
