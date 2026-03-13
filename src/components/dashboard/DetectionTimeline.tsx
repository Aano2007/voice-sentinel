import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

interface TimelinePoint {
  time: number;
  probability: number;
}

interface Props {
  data: TimelinePoint[];
}

export function DetectionTimeline({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-xs text-muted-foreground font-mono">Timeline data will appear during analysis</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
        Detection Timeline — Deepfake Probability Over Time
      </h4>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: "hsl(215, 15%, 50%)", fontFamily: "JetBrains Mono" }}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "hsl(215, 15%, 50%)", fontFamily: "JetBrains Mono" }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
              fontSize: 11,
            }}
            formatter={(val: number) => [`${val.toFixed(1)}%`, "Probability"]}
          />
          <ReferenceLine y={50} stroke="hsl(40, 95%, 55%)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="probability"
            stroke="hsl(0, 80%, 55%)"
            strokeWidth={2}
            fill="url(#probGradient)"
            dot={{ r: 3, fill: "hsl(0, 80%, 55%)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[9px] font-mono text-muted-foreground mt-1 text-center">
        Threshold: 50% — Above indicates deepfake likelihood
      </p>
    </motion.div>
  );
}
