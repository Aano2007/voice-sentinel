import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Users, CheckCircle2, XCircle, AlertTriangle,
  HelpCircle, FileAudio, Loader2, Info, ArrowRight,
  Activity, ShieldCheck, Radio,
} from "lucide-react";
import { compareVoices, type VoiceCompareResult } from "@/lib/audioAnalysis";

// ── theme ─────────────────────────────────────────────────────────────────────
const CARD   = "rgba(15,18,28,0.9)";
const BORDER = "rgba(255,255,255,0.06)";
const ACCENT = "#818cf8";

// ── metrics config ────────────────────────────────────────────────────────────
const METRICS = [
  {
    key: "spectralCentroid" as const,
    label: "Spectral Centroid",
    fmt: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)} kHz` : `${Math.round(v)} Hz`,
    tip: "Center of mass of the frequency spectrum — higher = brighter voice.",
  },
  {
    key: "zeroCrossingRate" as const,
    label: "Zero Crossing Rate",
    fmt: (v: number) => v.toFixed(4),
    tip: "How often the signal crosses zero — correlates with noisiness.",
  },
  {
    key: "pitchVariation" as const,
    label: "Pitch Variation",
    fmt: (v: number) => `${v.toFixed(1)} Hz`,
    tip: "Std deviation of fundamental frequency — measures pitch fluctuation.",
  },
  {
    key: "harmonicRatio" as const,
    label: "Harmonic Ratio",
    fmt: (v: number) => v.toFixed(3),
    tip: "Ratio of harmonic to total energy — higher = cleaner, more tonal voice.",
  },
  {
    key: "energyProfile" as const,
    label: "Energy Profile",
    fmt: (v: number) => v.toFixed(3),
    tip: "Overall signal energy normalized to [0,1] — reflects loudness.",
  },
] as const;

const INTERPRETATIONS: Record<string, string> = {
  "Same Speaker":      "All acoustic features are highly consistent across both recordings. This strongly indicates both samples were produced by the same speaker under similar conditions.",
  "Likely Same":       "Most acoustic features align closely. The recordings are most probably from the same speaker, though minor differences may reflect recording environment or emotional state.",
  "Uncertain":         "Acoustic features show partial overlap. The samples may be from the same speaker under very different conditions, or from speakers with similar vocal characteristics.",
  "Different Speaker": "Significant divergence detected across multiple acoustic dimensions. The evidence strongly suggests these samples are from different speakers.",
};

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function confidenceLabel(sim: number) {
  if (sim >= 90) return "Very High";
  if (sim >= 75) return "High";
  if (sim >= 55) return "Moderate";
  return "Low";
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info className="w-3 h-3 cursor-help" style={{ color: "rgba(255,255,255,0.2)" }} />
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl px-3 py-2.5 z-30 pointer-events-none"
            style={{ background: "rgba(10,12,20,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.7)" }}>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Upload Box ────────────────────────────────────────────────────────────────
function UploadBox({ label, file, onFile }: { label: string; file: File | null; onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false);
  const id = `vc-${label.replace(/\s/g, "")}`;
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      className="relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer"
      style={{
        borderColor: drag ? ACCENT : file ? "rgba(129,140,248,0.45)" : "rgba(255,255,255,0.1)",
        background:  drag ? "rgba(129,140,248,0.08)" : file ? "rgba(129,140,248,0.04)" : "rgba(255,255,255,0.02)",
        transform:   drag ? "scale(1.01)" : "scale(1)",
        padding: "20px",
      }}
    >
      <input type="file" accept="audio/*" id={id}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      {file ? (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)" }}>
            <FileAudio className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: "#e8eaf0" }}>{file.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{fmtBytes(file.size)}</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-lg shrink-0"
            style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", color: ACCENT }}>
            Replace
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Upload className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <div>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Drop file or click to browse</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>MP3 · WAV · OGG · M4A · FLAC · max 50 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.7, ease: "easeOut" }} />
      </div>
      <span className="text-[11px] font-bold w-9 text-right shrink-0 font-mono" style={{ color }}>{score}%</span>
    </div>
  );
}

// ── Empty right panel placeholder ─────────────────────────────────────────────
function ResultPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 py-16"
      style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
      <div className="flex flex-col items-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.15)" }}>
          <Activity className="w-7 h-7" style={{ color: "rgba(129,140,248,0.4)" }} />
        </div>
        <div>
          <p className="text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>No comparison yet</p>
          <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
            Upload two audio samples and click<br />"Compare Voices" to see results here
          </p>
        </div>
      </div>

      {/* Feature preview skeleton */}
      <div className="w-full px-8 space-y-3">
        {["Spectral Centroid", "Zero Crossing Rate", "Pitch Variation", "Harmonic Ratio", "Energy Profile"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-[11px] w-36 shrink-0" style={{ color: "rgba(255,255,255,0.15)" }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-full rounded-full" style={{ width: `${30 + i * 12}%`, background: "rgba(129,140,248,0.1)" }} />
            </div>
            <span className="text-[11px] w-8 text-right font-mono" style={{ color: "rgba(255,255,255,0.1)" }}>—</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 px-8">
        {[
          { icon: ShieldCheck, label: "Speaker ID" },
          { icon: Activity,    label: "Acoustic Match" },
          { icon: Radio,       label: "Waveform Diff" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Icon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.15)" }} />
            </div>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function VoiceCompare() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<VoiceCompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setLoading(true); setResult(null); setError(null); setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(p + 12, 88)), 200);
    try {
      const res = await compareVoices(file1, file2);
      clearInterval(iv); setProgress(100);
      setTimeout(() => { setResult(res); setLoading(false); setProgress(0); }, 300);
    } catch (e: any) {
      clearInterval(iv); setProgress(0);
      setError(e?.message ?? "Failed to analyze audio. Ensure files are valid audio.");
      setLoading(false);
    }
  };

  const verdictCfg = result ? ({
    "Same Speaker":      { icon: CheckCircle2, color: "#4ade80", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   glow: "0 0 32px rgba(34,197,94,0.15)"   },
    "Likely Same":       { icon: CheckCircle2, color: "#86efac", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.25)", glow: "0 0 32px rgba(134,239,172,0.12)" },
    "Uncertain":         { icon: HelpCircle,   color: "#facc15", bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.25)",   glow: "0 0 32px rgba(234,179,8,0.12)"   },
    "Different Speaker": { icon: XCircle,      color: "#f87171", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   glow: "0 0 32px rgba(239,68,68,0.15)"   },
  } as const)[result.verdict as "Same Speaker" | "Likely Same" | "Uncertain" | "Different Speaker"] : null;

  return (
    <div className="w-full h-full flex flex-col gap-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: "#e8eaf0" }}>Voice Comparison</h1>
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Upload two audio samples — AI extracts acoustic features to determine if they share the same speaker
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 min-h-0">

        {/* ── LEFT COLUMN: controls ── */}
        <div className="flex flex-col gap-4">

          {/* Sample A */}
          <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{ background: "rgba(129,140,248,0.15)", color: ACCENT }}>A</span>
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>Voice Sample A</p>
            </div>
            <UploadBox label="Voice Sample A" file={file1} onFile={setFile1} />
          </div>

          {/* Sample B */}
          <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{ background: "rgba(129,140,248,0.15)", color: ACCENT }}>B</span>
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>Voice Sample B</p>
            </div>
            <UploadBox label="Voice Sample B" file={file2} onFile={setFile2} />
          </div>

          {/* Compare button */}
          <motion.button
            onClick={handleCompare}
            disabled={!file1 || !file2 || loading}
            whileHover={!loading && file1 && file2 ? { scale: 1.01 } : {}}
            whileTap={!loading && file1 && file2 ? { scale: 0.99 } : {}}
            className="relative w-full h-13 rounded-2xl text-[13px] uppercase tracking-widest overflow-hidden transition-all font-semibold"
            style={{
              height: 52,
              background: !file1 || !file2 ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #6366f1, #818cf8)",
              border: `1px solid ${!file1 || !file2 ? "rgba(255,255,255,0.08)" : "rgba(129,140,248,0.5)"}`,
              color: !file1 || !file2 ? "rgba(255,255,255,0.2)" : "#fff",
              boxShadow: file1 && file2 && !loading ? "0 0 24px rgba(129,140,248,0.25)" : "none",
              cursor: !file1 || !file2 || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading && (
              <motion.div className="absolute inset-0 origin-left"
                style={{ background: "rgba(255,255,255,0.07)" }}
                animate={{ scaleX: progress / 100 }} transition={{ duration: 0.2 }} />
            )}
            <span className="relative flex items-center justify-center gap-2.5">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing… {progress < 100 ? `${progress}%` : "Finalizing"}</>
                : <><Users className="w-4 h-4" /> Compare Voices <ArrowRight className="w-4 h-4" /></>
              }
            </span>
          </motion.button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          {/* How it works info box */}
          {!result && !loading && (
            <div className="rounded-2xl p-4 mt-auto" style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.12)" }}>
              <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "rgba(129,140,248,0.6)" }}>How it works</p>
              <div className="space-y-2.5">
                {[
                  "Upload two audio files in any format",
                  "AI extracts 5 acoustic feature vectors",
                  "Features are compared with weighted scoring",
                  "Verdict and similarity score are returned",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                      style={{ background: "rgba(129,140,248,0.15)", color: ACCENT }}>{i + 1}</span>
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: results ── */}
        <div className="min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full">
                <ResultPlaceholder />
              </motion.div>
            ) : verdictCfg ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-4">

                {/* Verdict card */}
                <motion.div className="rounded-2xl p-6"
                  style={{ background: verdictCfg.bg, border: `1px solid ${verdictCfg.border}`, boxShadow: verdictCfg.glow }}
                  initial={{ scale: 0.97 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${verdictCfg.color}18`, border: `2px solid ${verdictCfg.color}40` }}>
                      <verdictCfg.icon className="w-7 h-7" style={{ color: verdictCfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Verdict</p>
                      <h2 className="text-[22px] font-bold" style={{ color: verdictCfg.color }}>
                        {result.verdict === "Same Speaker" ? "✔ Same Speaker Detected" : result.verdict}
                      </h2>
                      <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Confidence: <span style={{ color: verdictCfg.color }}>{confidenceLabel(result.similarity)}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Similarity</p>
                      <p className="font-mono text-[48px] font-bold leading-none" style={{ color: verdictCfg.color }}>{result.similarity}%</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${verdictCfg.color}70, ${verdictCfg.color})` }}
                        initial={{ width: 0 }} animate={{ width: `${result.similarity}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>0% — No Match</span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>100% — Identical</span>
                    </div>
                  </div>
                </motion.div>

                {/* Feature breakdown */}
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Acoustic Feature Breakdown
                  </p>
                  {/* Column headers */}
                  <div className="grid grid-cols-[1.6fr_0.9fr_0.9fr_0.7fr_1.6fr] gap-3 mb-2 px-2">
                    {["Feature", "Sample A", "Sample B", "Δ Diff", "Match Score"].map(h => (
                      <span key={h} className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>{h}</span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {METRICS.map(({ key, label, fmt, tip }, i) => {
                      const row = result.breakdown[key];
                      const diff = Math.abs(Number(row.a) - Number(row.b));
                      const diffStr = diff < 0.001 ? "0.000" : diff < 1 ? diff.toFixed(3) : diff >= 1000 ? `${(diff / 1000).toFixed(1)}k` : diff.toFixed(1);
                      return (
                        <motion.div key={key}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="grid grid-cols-[1.6fr_0.9fr_0.9fr_0.7fr_1.6fr] gap-3 items-center px-2 py-2.5 rounded-xl transition-colors"
                          style={{ background: "rgba(255,255,255,0.01)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(129,140,248,0.05)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-medium" style={{ color: "#e8eaf0" }}>{label}</span>
                            <Tooltip text={tip} />
                          </div>
                          <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{fmt(Number(row.a))}</span>
                          <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{fmt(Number(row.b))}</span>
                          <span className="font-mono text-[12px]" style={{ color: row.score >= 75 ? "#4ade80" : row.score >= 50 ? "#facc15" : "#f87171" }}>
                            {diffStr}
                          </span>
                          <ScoreBar score={row.score} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Interpretation */}
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                    AI Interpretation
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {INTERPRETATIONS[result.verdict]}
                  </p>
                </div>

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
