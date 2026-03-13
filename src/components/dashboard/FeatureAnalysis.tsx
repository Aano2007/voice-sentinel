import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";
import type { AudioFeatures } from "@/lib/audioAnalysis";
import { motion } from "framer-motion";

interface Props {
  features: AudioFeatures | null;
}

export function FeatureAnalysis({ features }: Props) {
  if (!features) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-xs text-muted-foreground font-mono">No features extracted</p>
      </div>
    );
  }

  const mfccData = features.mfcc.map((val, i) => ({
    name: `C${i}`,
    value: val,
  }));

  const radarData = [
    { feature: "MFCC", value: Math.abs(features.mfcc[0]) / 20 * 100 },
    { feature: "Spectral", value: features.spectralCentroid / 35 },
    { feature: "ZCR", value: features.zeroCrossingRate * 1000 },
    { feature: "Pitch", value: features.pitchVariation },
    { feature: "Harmonic", value: features.harmonicRatio * 100 },
  ];

  const featureStats = [
    { label: "Spectral Centroid", value: `${features.spectralCentroid.toFixed(0)} Hz` },
    { label: "Zero Crossing Rate", value: features.zeroCrossingRate.toFixed(4) },
    { label: "Pitch Variation", value: `${features.pitchVariation.toFixed(1)} Hz` },
    { label: "Harmonic Ratio", value: features.harmonicRatio.toFixed(3) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Feature Stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
          Audio Features
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {featureStats.map((s) => (
            <div key={s.label} className="p-2 rounded bg-secondary/50">
              <p className="text-[10px] text-muted-foreground font-mono">{s.label}</p>
              <p className="text-sm font-bold font-mono text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MFCC Bar Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
          MFCC Coefficients
        </h4>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={mfccData}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215, 15%, 50%)", fontFamily: "JetBrains Mono" }} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215, 15%, 50%)", fontFamily: "JetBrains Mono" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
            />
            <Bar dataKey="value" fill="hsl(160, 100%, 45%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
          Feature Profile
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(220, 14%, 18%)" />
            <PolarAngleAxis
              dataKey="feature"
              tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)", fontFamily: "JetBrains Mono" }}
            />
            <Radar dataKey="value" fill="hsl(190, 100%, 50%)" fillOpacity={0.2} stroke="hsl(190, 100%, 50%)" strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
