import { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { AudioDatabase } from "@/lib/audioDatabase";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, defs, linearGradient, stop,
} from "recharts";

// ─── Theme tokens ────────────────────────────────────────────────────────────
const PRIMARY   = "#3b82f6";   // blue-500
const PRIMARY_D = "#1d4ed8";   // blue-700  (darker for detection)
const MUTED     = "rgba(255,255,255,0.06)";
const AXIS_CLR  = "rgba(255,255,255,0.2)";
const TICK_CLR  = "rgba(255,255,255,0.35)";

// ─── Time filter ─────────────────────────────────────────────────────────────
type Filter = "1H" | "24H" | "7D";
const FILTERS: Filter[] = ["1H", "24H", "7D"];

function FilterBar({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
  return (
    <div className="flex gap-1">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1 text-xs font-mono rounded transition-all ${
            active === f
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
              : "text-muted-foreground border border-transparent hover:text-blue-400"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f0f0f] border border-blue-500/20 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-mono text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs font-mono" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Data generators ──────────────────────────────────────────────────────────
function genLineData(points: number) {
  return Array.from({ length: points }, (_, i) => ({
    t: `T-${points - i}`,
    confidence: +(40 + Math.random() * 55).toFixed(1),
    aiProb:     +(20 + Math.random() * 70).toFixed(1),
  }));
}

function genBarData(points: number) {
  return Array.from({ length: points }, (_, i) => ({
    t: `T-${points - i}`,
    deepfake: +(Math.random() * 60).toFixed(1),
    real:     +(Math.random() * 80).toFixed(1),
  }));
}

function genWaveData(points: number) {
  return Array.from({ length: points }, (_, i) => ({
    t: `${i}`,
    energy: +(10 + Math.random() * 90).toFixed(1),
  }));
}

const POINTS: Record<Filter, number> = { "1H": 12, "24H": 24, "7D": 14 };

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function GraphCard({
  title, description, icon: Icon, filter, onFilter, children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  filter: Filter;
  onFilter: (f: Filter) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-mono font-semibold text-foreground uppercase tracking-wider">{title}</h3>
        </div>
        <FilterBar active={filter} onChange={onFilter} />
      </div>
      <p className="text-xs font-mono text-muted-foreground mb-5">{description}</p>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function VoiceAnalytics() {
  const [filterA, setFilterA] = useState<Filter>("24H");
  const [filterB, setFilterB] = useState<Filter>("24H");
  const [filterC, setFilterC] = useState<Filter>("24H");

  const [lineData,  setLineData]  = useState(() => genLineData(POINTS["24H"]));
  const [barData,   setBarData]   = useState(() => genBarData(POINTS["24H"]));
  const [waveData,  setWaveData]  = useState(() => genWaveData(POINTS["24H"]));

  // Regenerate when filter changes
  useEffect(() => { setLineData(genLineData(POINTS[filterA])); }, [filterA]);
  useEffect(() => { setBarData(genBarData(POINTS[filterB]));   }, [filterB]);
  useEffect(() => { setWaveData(genWaveData(POINTS[filterC])); }, [filterC]);

  // Live update every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setLineData(genLineData(POINTS[filterA]));
      setBarData(genBarData(POINTS[filterB]));
      setWaveData(genWaveData(POINTS[filterC]));
    }, 3000);
    return () => clearInterval(id);
  }, [filterA, filterB, filterC]);

  const stats = AudioDatabase.getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Voice Analytics</h1>
        <p className="text-sm text-muted-foreground font-mono">Historical analysis and trends</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Analyses",    value: stats.total,                  icon: BarChart3  },
          { label: "Deepfakes Detected",value: stats.deepfakes,              icon: TrendingUp },
          { label: "Avg Risk Score",    value: stats.avgRiskScore.toFixed(1),icon: Activity   },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase">{s.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-primary">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── A: Voice Metrics History — Line Chart ── */}
      <GraphCard
        title="Voice Metrics History"
        description="Detection confidence and AI probability score over time"
        icon={Activity}
        filter={filterA}
        onFilter={setFilterA}
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={MUTED} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: TICK_CLR, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: TICK_CLR, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Line dataKey="confidence" name="Confidence" stroke={PRIMARY} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: PRIMARY }} />
            <Line dataKey="aiProb" name="AI Prob" stroke="rgba(59,130,246,0.45)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" activeDot={{ r: 3, fill: PRIMARY }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          {[{ label: "Confidence", color: PRIMARY, dash: false }, { label: "AI Probability", color: "rgba(59,130,246,0.5)", dash: true }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-5 h-px inline-block" style={{ background: l.color, borderTop: l.dash ? `1px dashed ${l.color}` : undefined }} />
              <span className="text-xs font-mono text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </GraphCard>

      {/* ── B: Deepfake Detection Trends — Bar Chart ── */}
      <GraphCard
        title="Deepfake Detection Trends"
        description="Deepfake vs real audio detections over time"
        icon={TrendingUp}
        filter={filterB}
        onFilter={setFilterB}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
            <defs>
              <linearGradient id="barDeep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY_D} stopOpacity={1} />
                <stop offset="100%" stopColor={PRIMARY_D} stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="barReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.5} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={MUTED} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: TICK_CLR, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: TICK_CLR, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="deepfake" name="Deepfake" fill="url(#barDeep)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="real"     name="Real"     fill="url(#barReal)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          {[{ label: "Deepfake", color: PRIMARY_D }, { label: "Real", color: "rgba(59,130,246,0.4)" }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
              <span className="text-xs font-mono text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </GraphCard>

      {/* ── C: Audio Energy — Waveform Bar Chart ── */}
      <GraphCard
        title="Audio Energy Graph"
        description="Amplitude and energy levels of audio signals"
        icon={BarChart3}
        filter={filterC}
        onFilter={setFilterC}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={waveData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="8%">
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={MUTED} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: TICK_CLR, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="energy" name="Energy" fill="url(#waveGrad)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs font-mono text-muted-foreground mt-3">Each bar represents an audio signal amplitude sample</p>
      </GraphCard>
    </div>
  );
}
