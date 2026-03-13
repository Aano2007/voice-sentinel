import { motion } from "framer-motion";

interface Props {
  riskScore: number; // 0-100
}

export function RiskMeter({ riskScore }: Props) {
  const angle = (riskScore / 100) * 180 - 90; // -90 to 90 degrees
  const color =
    riskScore < 30 ? "hsl(160, 100%, 45%)" : riskScore < 60 ? "hsl(40, 95%, 55%)" : "hsl(0, 80%, 55%)";
  const label = riskScore < 30 ? "LOW RISK" : riskScore < 60 ? "MODERATE" : "HIGH RISK";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Risk Assessment</h4>
      <div className="flex justify-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-[240px]">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(220, 14%, 18%)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (riskScore / 100) * 251.2 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
          {/* Needle */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1.5, ease: "easeOut", type: "spring" }}
            style={{ transformOrigin: "100px 100px" }}
          />
          <circle cx="100" cy="100" r="5" fill={color} />
          {/* Labels */}
          <text x="20" y="115" fontSize="9" fill="hsl(160, 100%, 45%)" fontFamily="JetBrains Mono">0</text>
          <text x="92" y="20" fontSize="9" fill="hsl(40, 95%, 55%)" fontFamily="JetBrains Mono">50</text>
          <text x="170" y="115" fontSize="9" fill="hsl(0, 80%, 55%)" fontFamily="JetBrains Mono">100</text>
        </svg>
      </div>
      <div className="text-center mt-2">
        <motion.p
          className="text-2xl font-bold font-mono"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {riskScore.toFixed(1)}
        </motion.p>
        <p className="text-[10px] font-mono tracking-widest" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  );
}
