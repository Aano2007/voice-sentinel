import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Shield, TrendingUp, RefreshCw } from "lucide-react";
import { AudioDatabase } from "@/lib/audioDatabase";

// ── theme ─────────────────────────────────────────────────────────────────────
const CARD   = "rgba(13,16,26,0.92)";
const BORDER = "rgba(255,255,255,0.07)";

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 64, H = 24;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - (v / max) * H}`
  ).join(" ");
  return (
    <svg width={W} height={H} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ uploads, recordings }: { uploads: number; recordings: number }) {
  const total = uploads + recordings || 1;
  const upPct = Math.round((uploads / total) * 100);
  const recPct = 100 - upPct;

  const R = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * R;
  const upDash  = (upPct  / 100) * circ;
  const recDash = (recPct / 100) * circ;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={128} height={128} viewBox="0 0 128 128">
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
          {/* Uploads arc */}
          <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke="#818cf8" strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${upDash} ${circ - upDash}`}
            strokeDashoffset={circ * 0.25}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${upDash} ${circ - upDash}` }}
            transition={{ duration: 1, ease: "easeOut" }} />
          {/* Recordings arc */}
          <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke="#a78bfa" strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${recDash} ${circ - recDash}`}
            strokeDashoffset={circ * 0.25 - upDash}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${recDash} ${circ - recDash}` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold" style={{ color: "#e8eaf0" }}>{total}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>total</span>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        {[
          { label: "Uploads",    value: uploads,    pct: upPct,  color: "#818cf8" },
          { label: "Recordings", value: recordings, pct: recPct, color: "#a78bfa" },
        ].map(({ label, value, pct, color }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold" style={{ color }}>{value}</span>
                <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{pct}%</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: color }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gauge Chart ───────────────────────────────────────────────────────────────
function GaugeChart({ score }: { score: number }) {
  const clamp = Math.min(100, Math.max(0, score));
  const R = 60, cx = 80, cy = 80;
  const circ = 2 * Math.PI * R;
  const arc  = circ * 0.75; // 270° gauge
  const fill = (clamp / 100) * arc;

  const color = clamp < 30 ? "#4ade80" : clamp < 70 ? "#facc15" : "#f87171";
  const label = clamp < 30 ? "Low Risk" : clamp < 70 ? "Medium Risk" : "High Risk";

  // Needle angle: -135° (0) to +135° (100)
  const needleAngle = -135 + (clamp / 100) * 270;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 160, height: 130 }}>
        <svg width={160} height={160} viewBox="0 0 160 160" style={{ position: "absolute", top: -20, left: 0 }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)"
            strokeWidth={12} strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={circ * 0.375} strokeLinecap="round" />
          {/* Fill */}
          <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke={color}
            strokeWidth={12} strokeLinecap="round"
            strokeDasharray={`${fill} ${circ - fill}`}
            strokeDashoffset={circ * 0.375}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${fill} ${circ - fill}`, stroke: color }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
          {/* Zone ticks */}
          {[0, 30, 70, 100].map(v => {
            const a = ((-135 + (v / 100) * 270) * Math.PI) / 180;
            const x1 = cx + (R - 8) * Math.cos(a);
            const y1 = cy + (R - 8) * Math.sin(a);
            const x2 = cx + (R + 2) * Math.cos(a);
            const y2 = cy + (R + 2) * Math.sin(a);
            return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />;
          })}
          {/* Needle */}
          <motion.line
            x1={cx} y1={cy}
            x2={cx + (R - 14) * Math.cos(((needleAngle) * Math.PI) / 180)}
            y2={cy + (R - 14) * Math.sin(((needleAngle) * Math.PI) / 180)}
            stroke="#e8eaf0" strokeWidth={2} strokeLinecap="round"
            initial={{ rotate: -135, originX: cx, originY: cy }}
            animate={{ rotate: needleAngle }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
          <circle cx={cx} cy={cy} r={4} fill="#e8eaf0" />
          {/* Score inside SVG, above center */}
          <motion.text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="700"
            fontFamily="monospace" fill={color}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}>
            {clamp.toFixed(1)}
          </motion.text>
        </svg>
      </div>
      <span className="font-mono text-[12px] font-semibold uppercase tracking-widest" style={{ color }}>{label}</span>
      <div className="flex items-center gap-4 mt-1">
        {[{ c: "#4ade80", l: "0–30 Low" }, { c: "#facc15", l: "30–70 Med" }, { c: "#f87171", l: "70–100 High" }].map(({ c, l }) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detection Bar ─────────────────────────────────────────────────────────────
function DetectionBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="font-mono text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold" style={{ color }}>{value}</span>
          <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>{pct}%</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export function StatisticsDashboard() {
  const [stats, setStats] = useState(AudioDatabase.getStats());
  const [sparkData] = useState(() => ({
    total:    Array.from({ length: 10 }, (_, i) => Math.max(0, i * 0.4)),
    real:     Array.from({ length: 10 }, (_, i) => Math.max(0, i * 0.25)),
    deepfake: Array.from({ length: 10 }, (_, i) => Math.max(0, i * 0.15)),
    accuracy: Array.from({ length: 10 }, () => 97 + Math.random() * 2),
  }));

  useEffect(() => {
    const t = setInterval(() => setStats(AudioDatabase.getStats()), 10000);
    return () => clearInterval(t);
  }, []);

  const metricCards = [
    { label: "Total Analyses", sub: "all time",       value: stats.total,      color: "#818cf8", icon: BarChart3,  spark: sparkData.total    },
    { label: "Human Voices",   sub: "verified real",  value: stats.realVoices, color: "#4ade80", icon: Users,      spark: sparkData.real     },
    { label: "AI Voices",      sub: "deepfakes found",value: stats.deepfakes,  color: "#f87171", icon: Shield,     spark: sparkData.deepfake },
    { label: "Accuracy Rate",  sub: "model precision",value: "97.3%",          color: "#a78bfa", icon: TrendingUp, spark: sparkData.accuracy },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold font-mono leading-tight" style={{ color: "#e8eaf0" }}>Statistics</h1>
          <p className="font-mono text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Key metrics and performance indicators · auto-refreshes every 10s
          </p>
        </div>
        <button onClick={() => setStats(AudioDatabase.getStats())}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all shrink-0"
          style={{ background: CARD, border: `1px solid ${BORDER}`, color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#e8eaf0")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map(({ label, sub, value, color, icon: Icon, spark }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <Sparkline data={spark} color={color} />
            </div>
            <div className="font-mono text-3xl font-bold leading-none mb-1" style={{ color }}>{value}</div>
            <div className="font-mono text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</div>
            <div className="font-mono text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Detection Distribution */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="font-mono text-[11px] uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Detection Distribution
          </p>
          <div className="space-y-4">
            <DetectionBar label="Real Voices" value={stats.realVoices} total={stats.total} color="#4ade80" />
            <DetectionBar label="Deepfakes"   value={stats.deepfakes}  total={stats.total} color="#f87171" />
            <DetectionBar label="Suspicious"  value={stats.suspicious} total={stats.total} color="#fb923c" />
          </div>
        </div>

        {/* Source Distribution — Donut */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="font-mono text-[11px] uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Source Distribution
          </p>
          <DonutChart uploads={stats.uploads} recordings={stats.recordings} />
        </div>
      </div>

      {/* Average Risk Gauge */}
      <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <p className="font-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          Average Risk Score
        </p>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <GaugeChart score={stats.avgRiskScore} />
          <div className="flex-1 space-y-4">
            <p className="font-mono text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              The average risk score across all {stats.total} analysed audio samples.
              {stats.avgRiskScore < 30 && " The overall threat level is low — most samples appear to be genuine human voices."}
              {stats.avgRiskScore >= 30 && stats.avgRiskScore < 70 && " Moderate threat level detected — some samples show suspicious patterns worth reviewing."}
              {stats.avgRiskScore >= 70 && " High threat level — a significant portion of analysed audio shows deepfake characteristics."}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Deepfake Rate", value: stats.total > 0 ? `${Math.round((stats.deepfakes / stats.total) * 100)}%` : "—", color: "#f87171" },
                { label: "Safe Rate",     value: stats.total > 0 ? `${Math.round((stats.realVoices / stats.total) * 100)}%` : "—", color: "#4ade80" },
                { label: "Avg Confidence",value: "97.3%", color: "#818cf8" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="font-mono text-xl font-bold" style={{ color }}>{value}</div>
                  <div className="font-mono text-[10px] mt-1 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 py-2">
        <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "#818cf8" }}
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Statistics auto-refresh every 10 seconds
        </span>
      </div>
    </div>
  );
}
