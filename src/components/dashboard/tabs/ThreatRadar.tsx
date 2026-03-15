import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, CheckCircle2, XCircle,
  Clock, RefreshCw, Radio, Scan,
} from "lucide-react";
import { AudioDatabase, type AudioRecord } from "@/lib/audioDatabase";

// ── theme ─────────────────────────────────────────────────────────────────────
const CARD   = "rgba(13,16,26,0.92)";
const BORDER = "rgba(255,255,255,0.07)";
const ACCENT = "#818cf8";

// ── types ─────────────────────────────────────────────────────────────────────
interface RadarPoint {
  id: string;
  angle: number;
  distance: number;
  riskScore: number;
  label: AudioRecord["result"]["label"];
  fileName: string;
  timestamp: number;
  active: boolean;
  justHit: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function recordsToPoints(records: AudioRecord[]): RadarPoint[] {
  return records.slice(0, 24).map((r, i, arr) => ({
    id: r.id,
    angle: (i / Math.max(arr.length, 1)) * 360,
    distance: 15 + (r.result.riskScore / 100) * 75,
    riskScore: r.result.riskScore,
    label: r.result.label,
    fileName: r.fileName,
    timestamp: r.timestamp,
    active: false,
    justHit: false,
  }));
}

function dotColor(label: AudioRecord["result"]["label"]) {
  if (label === "Deepfake Detected") return { fill: "#ef4444", glow: "rgba(239,68,68,0.6)" };
  if (label === "Suspicious")        return { fill: "#facc15", glow: "rgba(250,204,21,0.6)" };
  return                                    { fill: "#4ade80", glow: "rgba(74,222,128,0.6)" };
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// ── Spectrogram (canvas heatmap) ──────────────────────────────────────────────
function Spectrogram({ records }: { records: AudioRecord[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.clearRect(0, 0, W, H);

    if (records.length === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.font = `${12 * window.devicePixelRatio}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("No data — run an analysis to populate spectrogram", W / 2, H / 2);
      return;
    }

    const cols = Math.max(records.length * 4, 80);
    const rows = 48;
    const cw   = W / cols;
    const ch   = H / rows;

    // Inferno-style palette: dark-blue → cyan → yellow → white
    function infernoColor(t: number): string {
      const stops = [
        [0.00, [10,  10,  40]],
        [0.25, [80,  20, 120]],
        [0.50, [200, 60,  30]],
        [0.75, [240,180,  20]],
        [1.00, [252,255, 164]],
      ] as [number, number[]][];
      let lo = stops[0], hi = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i][0] && t <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break; }
      }
      const f = (t - lo[0]) / (hi[0] - lo[0]);
      const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * f);
      const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * f);
      const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * f);
      return `rgb(${r},${g},${b})`;
    }

    for (let col = 0; col < cols; col++) {
      const recIdx = Math.floor((col / cols) * records.length);
      const rec    = records[recIdx];
      const base   = rec.result.riskScore / 100;

      for (let row = 0; row < rows; row++) {
        const freqFactor = 1 - row / rows;
        const noise = (Math.sin(col * 0.3 + row * 0.7) * 0.5 + 0.5) * 0.25;
        const energy = Math.min(1, base * freqFactor * 1.4 + noise);
        ctx.fillStyle = infernoColor(energy);
        ctx.fillRect(col * cw, row * ch, cw + 0.5, ch + 0.5);
      }
    }

    // Axis labels
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = `${10 * window.devicePixelRatio}px monospace`;
    ctx.textAlign = "left";
    const freqLabels = ["22k", "16k", "11k", "5.5k", "0 Hz"];
    freqLabels.forEach((lbl, i) => {
      const y = (i / (freqLabels.length - 1)) * H;
      ctx.fillText(lbl, 4 * window.devicePixelRatio, y + 12 * window.devicePixelRatio);
    });
  }, [records]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Spectrogram — Frequency vs Time
        </span>
        <div className="flex items-center gap-3">
          {[
            { label: "Low",  color: "rgb(10,10,40)"   },
            { label: "Mid",  color: "rgb(200,60,30)"  },
            { label: "High", color: "rgb(252,255,164)" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
              <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4">
        <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: 140, display: "block" }} />
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>← Earlier</span>
          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>Time →</span>
        </div>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export function ThreatRadar() {
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [points,  setPoints]  = useState<RadarPoint[]>([]);
  const [scanAngle, setScanAngle] = useState(0);
  const [lastHit,   setLastHit]   = useState<RadarPoint | null>(null);
  const scanRef = useRef(0);

  const loadData = useCallback(() => {
    const all = AudioDatabase.getAll();
    setRecords(all);
    setPoints(recordsToPoints(all));
  }, []);

  useEffect(() => { loadData(); const t = setInterval(loadData, 5000); return () => clearInterval(t); }, [loadData]);

  // Sweep
  useEffect(() => {
    const id = setInterval(() => {
      setScanAngle(prev => {
        const next = (prev + 1.2) % 360;
        scanRef.current = next;
        setPoints(pts => pts.map(p => {
          const diff = Math.abs(((p.angle - next + 540) % 360) - 180);
          const hit  = diff < 9;
          if (hit && p.label !== "Real Voice") setLastHit({ ...p, justHit: true });
          return { ...p, active: hit, justHit: hit && p.label !== "Real Voice" };
        }));
        return next;
      });
    }, 28);
    return () => clearInterval(id);
  }, []);

  const stats = {
    total:      records.length,
    deepfake:   records.filter(r => r.result.label === "Deepfake Detected").length,
    suspicious: records.filter(r => r.result.label === "Suspicious").length,
    safe:       records.filter(r => r.result.label === "Real Voice").length,
  };

  const recent = records.slice(0, 6);

  const statCards = [
    { label: "Total Scans",  sub: "last 24 hours", value: stats.total,      color: "#818cf8", icon: Scan         },
    { label: "Deepfakes",    sub: "detected",       value: stats.deepfake,   color: "#f87171", icon: XCircle      },
    { label: "Suspicious",   sub: "flagged",        value: stats.suspicious, color: "#facc15", icon: AlertTriangle },
    { label: "Safe",         sub: "verified real",  value: stats.safe,       color: "#4ade80", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold font-mono leading-tight" style={{ color: "#e8eaf0" }}>Threat Radar</h1>
          <p className="font-mono text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Live map of all analysed audio — each dot represents a real detection
          </p>
        </div>
        <button onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all shrink-0"
          style={{ background: CARD, border: `1px solid ${BORDER}`, color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#e8eaf0")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl p-20 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.15)" }}>
            <Activity className="w-7 h-7" style={{ color: "rgba(129,140,248,0.4)" }} />
          </div>
          <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No detections yet</p>
          <p className="font-mono text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
            Analyse an audio file or use Real-time Analysis — results will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* ── LEFT: Radar + Spectrogram ── */}
          <div className="space-y-5">

            {/* Radar card */}
            <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Radar Visualization
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)" }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: ACCENT }}>Scanning</span>
                </div>
              </div>

              <div className="relative w-full aspect-square max-w-[480px] mx-auto select-none">

                {/* Grid rings */}
                {[20, 40, 60, 80, 100].map(s => (
                  <div key={s} className="absolute inset-0 m-auto rounded-full"
                    style={{ width: `${s}%`, height: `${s}%`, border: "1px solid rgba(129,140,248,0.12)" }} />
                ))}

                {/* Ring labels */}
                {[{ s: 20, lbl: "LOW" }, { s: 40, lbl: "MED" }, { s: 60, lbl: "HIGH" }].map(({ s, lbl }) => (
                  <span key={s} className="absolute font-mono text-[11px] font-semibold"
                    style={{ top: `${50 - s / 2 - 1}%`, left: "52%", color: "rgba(129,140,248,0.45)" }}>
                    {lbl}
                  </span>
                ))}

                {/* Axis lines */}
                {[0, 30, 60, 90, 120, 150].map(a => (
                  <div key={a} className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
                    style={{ background: "rgba(129,140,248,0.08)", transform: `rotate(${a}deg)` }} />
                ))}
                {[0, 30, 60, 90, 120, 150].map(a => (
                  <div key={`r${a}`} className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
                    style={{ background: "rgba(129,140,248,0.08)", transform: `rotate(${a + 180}deg)` }} />
                ))}

                {/* Sweep glow cone */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `conic-gradient(from ${scanAngle - 30}deg at 50% 50%, transparent 0deg, rgba(129,140,248,0.07) 20deg, rgba(129,140,248,0.18) 30deg, transparent 30deg)`,
                  borderRadius: "50%",
                }} />

                {/* Sweep line */}
                <div className="absolute top-1/2 left-1/2 w-1/2 origin-left pointer-events-none"
                  style={{
                    height: "2px",
                    background: "linear-gradient(to right, rgba(129,140,248,0.95), transparent)",
                    transform: `rotate(${scanAngle}deg)`,
                    boxShadow: "0 0 8px rgba(129,140,248,0.6)",
                  }} />

                {/* Detection points */}
                {points.map(p => {
                  const rad = (p.angle * Math.PI) / 180;
                  const r   = p.distance / 2;
                  const x   = Math.cos(rad) * r;
                  const y   = Math.sin(rad) * r;
                  const c   = dotColor(p.label);
                  return (
                    <div key={p.id} className="absolute top-1/2 left-1/2 group"
                      style={{ transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))` }}>
                      {/* Glow ring when active */}
                      {p.active && (
                        <motion.div className="absolute rounded-full"
                          style={{ width: 22, height: 22, top: -7, left: -7, background: c.glow, filter: "blur(4px)" }}
                          animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.2, 0.8] }}
                          transition={{ duration: 0.7, repeat: 2 }} />
                      )}
                      {/* Dot */}
                      <div className="w-3 h-3 rounded-full transition-all duration-150"
                        style={{
                          background: c.fill,
                          boxShadow: p.active ? `0 0 10px ${c.glow}, 0 0 20px ${c.glow}` : `0 0 4px ${c.glow}`,
                          transform: p.active ? "scale(1.5)" : "scale(1)",
                          opacity: p.active ? 1 : 0.7,
                        }} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="rounded-xl px-3 py-2 text-[11px] font-mono whitespace-nowrap"
                          style={{ background: "rgba(10,12,20,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
                          <p className="font-semibold truncate max-w-[160px]" style={{ color: "#e8eaf0" }}>{p.fileName}</p>
                          <p style={{ color: c.fill }}>{p.label} — {p.riskScore.toFixed(0)}%</p>
                          <p style={{ color: "rgba(255,255,255,0.35)" }}>{timeAgo(p.timestamp)}</p>
                        </div>
                        <div className="w-2 h-2 rotate-45 -mt-1" style={{ background: "rgba(10,12,20,0.98)", border: "1px solid rgba(255,255,255,0.1)" }} />
                      </div>
                    </div>
                  );
                })}

                {/* Centre */}
                <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full z-10"
                  style={{ transform: "translate(-50%,-50%)", background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }} />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-5 mt-6 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { color: "#ef4444", label: "Deepfake Detection" },
                  { color: "#facc15", label: "Suspicious Pattern"  },
                  { color: "#4ade80", label: "Real Voice"          },
                  { color: ACCENT,    label: "Distance = Risk %"   },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spectrogram */}
            <Spectrogram records={records} />
          </div>

          {/* ── RIGHT: Metrics + Alert + Feed ── */}
          <div className="flex flex-col gap-4">

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map(({ label, sub, value, color, icon: Icon }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="font-mono text-3xl font-bold leading-none mb-1" style={{ color }}>{value}</div>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Alert box */}
            <AnimatePresence mode="wait">
              {lastHit && (
                <motion.div key={lastHit.id}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl p-4"
                  style={{
                    background: lastHit.label === "Deepfake Detected" ? "rgba(239,68,68,0.08)" : "rgba(250,204,21,0.08)",
                    border: `1px solid ${lastHit.label === "Deepfake Detected" ? "rgba(239,68,68,0.35)" : "rgba(250,204,21,0.35)"}`,
                    boxShadow: lastHit.label === "Deepfake Detected" ? "0 0 20px rgba(239,68,68,0.1)" : "0 0 20px rgba(250,204,21,0.1)",
                  }}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 shrink-0"
                      style={{ color: lastHit.label === "Deepfake Detected" ? "#f87171" : "#facc15" }} />
                    <span className="font-mono text-[12px] font-bold uppercase tracking-wider"
                      style={{ color: lastHit.label === "Deepfake Detected" ? "#f87171" : "#facc15" }}>
                      {lastHit.label}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>File</span>
                      <span className="font-mono text-[11px] font-medium truncate max-w-[140px]" style={{ color: "#e8eaf0" }}>{lastHit.fileName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Risk Score</span>
                      <span className="font-mono text-[14px] font-bold"
                        style={{ color: lastHit.label === "Deepfake Detected" ? "#f87171" : "#facc15" }}>
                        {lastHit.riskScore.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Detected</span>
                      <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{timeAgo(lastHit.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent detections */}
            <div className="rounded-2xl p-4 flex-1" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <p className="font-mono text-[11px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Recent Detections
              </p>
              {recent.length === 0 ? (
                <p className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No records yet.</p>
              ) : (
                <div className="space-y-0">
                  {recent.map((r, i) => {
                    const c = dotColor(r.result.label);
                    return (
                      <div key={r.id}>
                        <div className="flex items-start gap-3 py-3">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: c.fill, boxShadow: `0 0 5px ${c.glow}` }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-[13px] font-medium truncate" style={{ color: "#e8eaf0" }}>{r.fileName}</p>
                            <p className="font-mono text-[11px] mt-0.5" style={{ color: c.fill }}>{r.result.label}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                Risk: <span style={{ color: c.fill }}>{r.result.riskScore.toFixed(0)}%</span>
                              </span>
                              <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                <Clock className="w-2.5 h-2.5" />{timeAgo(r.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {i < recent.length - 1 && (
                          <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scan status */}
            <div className="rounded-2xl p-3 text-center"
              style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.2)" }}>
              <div className="flex items-center justify-center gap-2">
                <motion.span className="w-2 h-2 rounded-full" style={{ background: ACCENT }}
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: ACCENT }}>
                  Scanning · {stats.total} records mapped
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
