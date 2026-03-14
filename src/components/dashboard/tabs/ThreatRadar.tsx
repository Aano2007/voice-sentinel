import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { AudioDatabase, type AudioRecord } from "@/lib/audioDatabase";

// Convert a record into a radar point
// - angle: spread evenly by index around the circle
// - distance: driven by riskScore (0-100 → 15-90% of radius)
interface RadarPoint {
  id: string;
  angle: number;       // degrees
  distance: number;    // % of radius (15-90)
  riskScore: number;
  label: AudioRecord["result"]["label"];
  fileName: string;
  timestamp: number;
  active: boolean;     // lit up by sweep beam
}

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
  }));
}

function pointColor(label: AudioRecord["result"]["label"], active: boolean) {
  const base =
    label === "Deepfake Detected" ? "bg-red-500" :
    label === "Suspicious"        ? "bg-yellow-500" :
                                    "bg-green-500";
  return active ? base + " scale-150" : base + " opacity-60";
}

function ringColor(label: AudioRecord["result"]["label"]) {
  return label === "Deepfake Detected" ? "bg-red-500" :
         label === "Suspicious"        ? "bg-yellow-500" :
                                         "bg-green-500";
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function ThreatRadar() {
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [points, setPoints] = useState<RadarPoint[]>([]);
  const [scanAngle, setScanAngle] = useState(0);
  const [lastHit, setLastHit] = useState<RadarPoint | null>(null);
  const scanRef = useRef(0);

  // Load real data
  const loadData = () => {
    const all = AudioDatabase.getAll();
    setRecords(all);
    setPoints(recordsToPoints(all));
  };

  useEffect(() => {
    loadData();
    // Refresh every 5s in case new analyses come in
    const refresh = setInterval(loadData, 5000);
    return () => clearInterval(refresh);
  }, []);

  // Sweep beam
  useEffect(() => {
    const id = setInterval(() => {
      setScanAngle((prev) => {
        const next = (prev + 1.5) % 360;
        scanRef.current = next;

        // Activate points within ±8° of beam
        setPoints((pts) =>
          pts.map((p) => {
            const diff = Math.abs(((p.angle - next + 540) % 360) - 180);
            const hit = diff < 8;
            if (hit && p.label !== "Real Voice") setLastHit(p);
            return { ...p, active: hit };
          })
        );

        return next;
      });
    }, 30);
    return () => clearInterval(id);
  }, []);

  const stats = {
    total:    records.length,
    deepfake: records.filter((r) => r.result.label === "Deepfake Detected").length,
    suspicious: records.filter((r) => r.result.label === "Suspicious").length,
    safe:     records.filter((r) => r.result.label === "Real Voice").length,
  };

  const recent = records.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-primary mb-1">Threat Radar</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Live map of all your analysed audio — each dot is a real detection
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e1e1e] bg-white/5 hover:bg-white/10 transition-all font-mono text-xs text-[#a3a3a3] hover:text-[#fafafa]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {records.length === 0 ? (
        /* Empty state */
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-mono text-muted-foreground text-sm">No detections yet.</p>
          <p className="font-mono text-muted-foreground text-xs mt-1">
            Analyse an audio file or use Real-time Analysis — results will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Radar canvas ── */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="relative w-full aspect-square max-w-lg mx-auto select-none">

              {/* Grid rings */}
              {[25, 50, 75, 100].map((s) => (
                <div
                  key={s}
                  className="absolute inset-0 m-auto rounded-full border border-primary/15"
                  style={{ width: `${s}%`, height: `${s}%` }}
                />
              ))}

              {/* Ring labels */}
              {[
                { s: 25, label: "LOW" },
                { s: 50, label: "MED" },
                { s: 75, label: "HIGH" },
              ].map(({ s, label }) => (
                <span
                  key={s}
                  className="absolute font-mono text-[9px] text-primary/30"
                  style={{
                    top: `${50 - s / 2}%`,
                    left: "51%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {label}
                </span>
              ))}

              {/* Axis lines */}
              {[0, 45, 90, 135].map((a) => (
                <div
                  key={a}
                  className="absolute top-1/2 left-1/2 w-1/2 h-px bg-primary/10 origin-left"
                  style={{ transform: `rotate(${a}deg)` }}
                />
              ))}
              {[0, 45, 90, 135].map((a) => (
                <div
                  key={`r${a}`}
                  className="absolute top-1/2 left-1/2 w-1/2 h-px bg-primary/10 origin-left"
                  style={{ transform: `rotate(${a + 180}deg)` }}
                />
              ))}

              {/* Sweep beam — single line */}
              <div
                className="absolute top-1/2 left-1/2 w-1/2 origin-left pointer-events-none"
                style={{
                  height: "2px",
                  background: "linear-gradient(to right, rgba(59,130,246,0.9), transparent)",
                  transform: `rotate(${scanAngle}deg)`,
                }}
              />

              {/* Detection points */}
              {points.map((p) => {
                const rad = (p.angle * Math.PI) / 180;
                const r = p.distance / 2; // % of half-width
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <div
                    key={p.id}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group"
                    style={{ transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))` }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${pointColor(p.label, p.active)}`}>
                      {p.active && (
                        <div className={`w-5 h-5 rounded-full absolute -inset-1 ${ringColor(p.label)} opacity-30 animate-ping`} />
                      )}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-2.5 py-1.5 text-[10px] font-mono whitespace-nowrap shadow-xl">
                        <p className="text-[#fafafa] truncate max-w-[140px]">{p.fileName}</p>
                        <p className={`${p.label === "Deepfake Detected" ? "text-red-400" : p.label === "Suspicious" ? "text-yellow-400" : "text-green-400"}`}>
                          {p.label} — {p.riskScore.toFixed(0)}%
                        </p>
                        <p className="text-[#a3a3a3]">{timeAgo(p.timestamp)}</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#0a0a0a] border-r border-b border-[#1e1e1e] rotate-45 -mt-1" />
                    </div>
                  </div>
                );
              })}

              {/* Centre dot */}
              <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-primary border-2 border-background z-10" />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              {[
                { color: "bg-red-500",    label: "Deepfake" },
                { color: "bg-yellow-500", label: "Suspicious" },
                { color: "bg-green-500",  label: "Real Voice" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="font-mono text-[10px] text-[#a3a3a3]">{l.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/40 border border-primary" />
                <span className="font-mono text-[10px] text-[#a3a3a3]">Distance = Risk %</span>
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Scans",  value: stats.total,      color: "text-blue-400",   icon: Activity },
                { label: "Deepfakes",    value: stats.deepfake,   color: "text-red-400",    icon: XCircle },
                { label: "Suspicious",   value: stats.suspicious, color: "text-yellow-400", icon: AlertTriangle },
                { label: "Safe",         value: stats.safe,       color: "text-green-400",  icon: CheckCircle2 },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Last beam hit */}
            <AnimatePresence mode="wait">
              {lastHit && (
                <motion.div
                  key={lastHit.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`rounded-xl border p-3 ${
                    lastHit.label === "Deepfake Detected"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-yellow-500/10 border-yellow-500/30"
                  }`}
                >
                  <p className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1">Beam Hit</p>
                  <p className={`font-mono text-xs font-bold ${lastHit.label === "Deepfake Detected" ? "text-red-400" : "text-yellow-400"}`}>
                    {lastHit.label}
                  </p>
                  <p className="font-mono text-[10px] text-[#a3a3a3] truncate mt-0.5">{lastHit.fileName}</p>
                  <p className="font-mono text-[10px] text-[#a3a3a3]">Risk: {lastHit.riskScore.toFixed(0)}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent detections feed */}
            <div className="bg-card border border-border rounded-xl p-4 flex-1">
              <p className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-3">Recent Detections</p>
              <div className="space-y-2">
                {recent.length === 0 && (
                  <p className="font-mono text-[10px] text-[#a3a3a3]">No records yet.</p>
                )}
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      r.result.label === "Deepfake Detected" ? "bg-red-500" :
                      r.result.label === "Suspicious"        ? "bg-yellow-500" :
                                                               "bg-green-500"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] text-[#fafafa] truncate">{r.fileName}</p>
                      <p className="font-mono text-[9px] text-[#a3a3a3]">
                        {r.result.label} · {r.result.riskScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5 text-[#a3a3a3]" />
                      <span className="font-mono text-[9px] text-[#a3a3a3]">{timeAgo(r.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan status */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                SCANNING · {stats.total} RECORDS MAPPED
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
