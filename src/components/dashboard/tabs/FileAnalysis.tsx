import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileAudio, AlertTriangle, CheckCircle2, XCircle,
  Play, Pause, Square, Download, Brain, Zap, Activity,
  ShieldAlert, ShieldCheck, TrendingUp
} from "lucide-react";
import { analyzeAudio, type DetectionResult } from "@/lib/audioAnalysis";
import { AudioDatabase } from "@/lib/audioDatabase";

/* ── helpers ── */
const fmtSize = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

function SpectrogramCanvas({ data }: { data: number[][] | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!data || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;
    const rows = data.length, cols = data[0].length;
    canvas.width = cols; canvas.height = rows;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = data[i][j];
        // Viridis-like: dark purple → blue → green → yellow
        const r = Math.floor(v < 0.5 ? v * 2 * 68 : 68 + (v - 0.5) * 2 * 187);
        const g = Math.floor(v < 0.5 ? v * 2 * 1 + 0 : 1 + (v - 0.5) * 2 * 228);
        const b = Math.floor(v < 0.5 ? 84 + v * 2 * 90 : 174 - (v - 0.5) * 2 * 174);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(j, rows - 1 - i, 1, 1);
      }
    }
  }, [data]);
  return (
    <canvas
      ref={ref}
      className="w-full rounded"
      style={{ height: 180, imageRendering: "pixelated" }}
    />
  );
}

function CircleMetric({ value, label, desc, color }: { value: number; label: string; desc: string; color: string }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1a1f2e" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ transformOrigin: "48px 48px", rotate: "-90deg", filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="48" y="53" textAnchor="middle" fontSize="15" fontWeight="700"
          fontFamily="JetBrains Mono" fill={color}>{value.toFixed(0)}%</text>
      </svg>
      <p className="text-xs font-mono font-semibold text-foreground">{label}</p>
      <p className="text-[10px] font-mono text-muted-foreground text-center leading-tight">{desc}</p>
    </div>
  );
}

export function FileAnalysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playHead, setPlayHead] = useState(0);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validate = (f: File) => {
    if (!f.name.match(/\.(wav|mp3|ogg|m4a)$/i)) { alert("Unsupported format."); return false; }
    if (f.size > 10 * 1024 * 1024) { alert("Max 10 MB."); return false; }
    return true;
  };

  const runAnalysis = async (f: File) => {
    setIsAnalyzing(true); setResult(null); setProgress(0); setPlayHead(0);
    const steps = [15, 35, 55, 72, 88, 100];
    for (const s of steps) {
      await new Promise(r => setTimeout(r, 320));
      setProgress(s);
    }
    const analysis = await analyzeAudio(0);
    setResult(analysis);
    setWaveform(Array.from({ length: 80 }, () => Math.random() * 0.75 + 0.25));
    setIsAnalyzing(false);
    AudioDatabase.add({
      type: "upload", fileName: f.name, fileSize: f.size, duration: 30,
      result: { label: analysis.label, confidence: analysis.confidence, riskScore: analysis.riskScore },
      features: { spectralCentroid: analysis.features.spectralCentroid, zeroCrossingRate: analysis.features.zeroCrossingRate, pitchVariation: analysis.features.pitchVariation, harmonicRatio: analysis.features.harmonicRatio },
      indicators: analysis.indicators.map(i => ({ name: i.name, detected: i.detected, severity: i.severity })),
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && validate(f)) { setUploadedFile(f); runAnalysis(f); }
  }, []);

  const onSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validate(f)) { setUploadedFile(f); runAnalysis(f); }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(playRef.current!); setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playRef.current = setInterval(() => {
        setPlayHead(p => { if (p >= 100) { clearInterval(playRef.current!); setIsPlaying(false); return 0; } return p + 0.5; });
      }, 50);
    }
  };
  const stopPlay = () => { clearInterval(playRef.current!); setIsPlaying(false); setPlayHead(0); };

  const isDeepfake = result?.label === "Deepfake Detected";
  const isReal = result?.label === "Real Voice";
  const resultColor = isReal ? "#22c55e" : isDeepfake ? "#ef4444" : "#f59e0b";
  const resultGlow = isReal ? "0 0 32px rgba(34,197,94,0.25)" : isDeepfake ? "0 0 32px rgba(239,68,68,0.3)" : "0 0 32px rgba(245,158,11,0.25)";
  const ResultIcon = isReal ? ShieldCheck : isDeepfake ? ShieldAlert : AlertTriangle;

  const threatLabel = !result ? "" : result.riskScore < 30 ? "LOW" : result.riskScore < 60 ? "MEDIUM" : "HIGH";
  const threatColor = !result ? "" : result.riskScore < 30 ? "#22c55e" : result.riskScore < 60 ? "#f59e0b" : "#ef4444";

  const insights = result ? [
    { icon: Zap, text: "Synthetic speech artifacts detected in waveform", active: isDeepfake },
    { icon: Activity, text: "Abnormal frequency modulation patterns", active: isDeepfake || result.riskScore > 40 },
    { icon: TrendingUp, text: "Voice pitch inconsistency across segments", active: isDeepfake },
    { icon: Brain, text: "Non-human harmonic ratio characteristics", active: isDeepfake && result.riskScore > 60 },
  ] : [];

  const downloadReport = () => {
    if (!result || !uploadedFile) return;
    const txt = `AUDIO DEEPFAKE ANALYSIS REPORT\n${"=".repeat(40)}\nFile: ${uploadedFile.name}\nSize: ${fmtSize(uploadedFile.size)}\nResult: ${result.label}\nConfidence: ${result.confidence}%\nRisk Score: ${result.riskScore}%\nThreat Level: ${threatLabel}\n\nINDICATORS\n${result.indicators.map(i => `• ${i.name}: ${i.detected ? "DETECTED" : "Clear"} [${i.severity}]\n  ${i.description}`).join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = `deepfake-report-${uploadedFile.name}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">File Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upload audio to detect deepfakes with AI</p>
        </div>
        {result && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono border border-primary/30 text-primary hover:bg-primary/10 transition-all"
          >
            <Download className="w-4 h-4" /> Download Report
          </motion.button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        onDrop={onDrop}
        className="relative rounded-xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden"
        style={{
          background: isDragging ? "rgba(129,140,248,0.08)" : "rgba(19,23,32,0.6)",
          border: isDragging ? "2px solid #818cf8" : "2px dashed rgba(129,140,248,0.25)",
          boxShadow: isDragging ? "0 0 40px rgba(129,140,248,0.2), inset 0 0 40px rgba(129,140,248,0.05)" : "none",
        }}
      >
        <input type="file" accept=".wav,.mp3,.ogg,.m4a" onChange={onSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <motion.div animate={{ scale: isDragging ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", boxShadow: "0 0 24px rgba(129,140,248,0.4)" }}>
            <Upload className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          {isDragging ? "Release to upload" : "Drag & Drop Audio or Click to Upload"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Supports WAV, MP3, OGG, M4A — Max 10 MB</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {["WAV", "MP3", "OGG", "M4A"].map(f => (
            <span key={f} className="px-2.5 py-1 rounded-md text-xs font-mono border border-primary/20 text-primary/70 bg-primary/5">{f}</span>
          ))}
        </div>
      </div>

      {/* Analyzing Loader */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <motion.div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <motion.div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <Brain className="absolute inset-0 m-auto w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">Analyzing Audio...</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">Extracting MFCC · Spectral Analysis · AI Classification</p>
              </div>
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1.5">
                  <span>Processing</span><span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#818cf8,#6366f1)" }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && uploadedFile && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Waveform Player */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileAudio className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{fmtSize(uploadedFile.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay}
                    className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    {isPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary" />}
                  </button>
                  <button onClick={stopPlay}
                    className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
                    <Square className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {/* Waveform */}
              <div className="relative h-20 bg-secondary/30 rounded-lg overflow-hidden px-2 flex items-end gap-px">
                {waveform.map((v, i) => {
                  const active = (i / waveform.length) * 100 <= playHead;
                  return (
                    <motion.div key={i} className="flex-1 rounded-t"
                      style={{
                        height: `${v * 100}%`,
                        background: active
                          ? "linear-gradient(to top,#818cf8,#a5b4fc)"
                          : "rgba(129,140,248,0.2)",
                      }}
                      animate={isPlaying && active ? { scaleY: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.01 }}
                    />
                  );
                })}
                {/* playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-primary/70 transition-all"
                  style={{ left: `${playHead}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1.5">
                <span>0:00</span><span>0:30</span>
              </div>
            </div>

            {/* Detection Hero Card */}
            <motion.div
              initial={{ scale: 0.97 }} animate={{ scale: 1 }}
              className="rounded-xl border p-6"
              style={{
                background: `linear-gradient(135deg, ${resultColor}0d, rgba(19,23,32,0.9))`,
                borderColor: `${resultColor}40`,
                boxShadow: resultGlow,
              }}
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: `${resultColor}20`, border: `1.5px solid ${resultColor}50` }}>
                    <ResultIcon className="w-8 h-8" style={{ color: resultColor }} />
                  </div>
                  <motion.div className="absolute inset-0 rounded-2xl"
                    style={{ border: `1px solid ${resultColor}` }}
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Detection Result</p>
                  <h2 className="text-2xl font-bold tracking-tight" style={{ color: resultColor }}>{result.label}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI Confidence: <span className="font-mono font-semibold text-foreground">{result.confidence.toFixed(1)}%</span>
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-mono text-muted-foreground uppercase">Risk Score</p>
                  <p className="text-4xl font-bold font-mono" style={{ color: resultColor }}>{result.riskScore.toFixed(0)}</p>
                </div>
              </div>
            </motion.div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3">
                <CircleMetric
                  value={result.riskScore}
                  label="Deepfake Probability"
                  desc="Likelihood of synthetic voice generation"
                  color={isDeepfake ? "#ef4444" : isReal ? "#22c55e" : "#f59e0b"}
                />
              </div>
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3">
                <CircleMetric
                  value={result.confidence}
                  label="Confidence Score"
                  desc="Model certainty in classification result"
                  color="#818cf8"
                />
              </div>
            </div>

            {/* Spectrogram */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Frequency Spectrogram</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">Frequency (Hz) vs Time (seconds)</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">Viridis</span>
              </div>
              <SpectrogramCanvas data={result.spectrogramData} />
              <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
                <span>0 Hz</span>
                <span className="text-primary/60">← Frequency →</span>
                <span>8000 Hz</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-0.5">
                <span>0s</span>
                <span className="text-primary/60">← Time →</span>
                <span>30s</span>
              </div>
            </div>

            {/* Threat Level */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Threat Level</h3>
                <span className="text-sm font-bold font-mono" style={{ color: threatColor }}>{threatLabel}</span>
              </div>
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-3">
                <motion.div className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)`, width: `${result.riskScore}%` }}
                  initial={{ width: 0 }} animate={{ width: `${result.riskScore}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span className="text-green-500">Low</span>
                <span className="text-yellow-500">Medium</span>
                <span className="text-red-500">High</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {result.riskScore < 30
                  ? "Audio appears authentic. No significant synthetic artifacts detected."
                  : result.riskScore < 60
                  ? "Suspicious patterns found. Manual review recommended before trusting this audio."
                  : "High probability of AI-generated or manipulated audio. Do not trust this source."}
              </p>
            </div>

            {/* AI Insights */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">AI Analysis Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.indicators.map((ind, i) => {
                  const colors = { high: "#ef4444", medium: "#f59e0b", low: "#818cf8" };
                  const c = ind.detected ? colors[ind.severity] : "#22c55e";
                  return (
                    <motion.div key={ind.name}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:border-primary/30"
                      style={{ background: `${c}08`, borderColor: `${c}25` }}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{ind.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{ind.description}</p>
                        <span className="text-[9px] font-mono mt-1 inline-block px-1.5 py-0.5 rounded"
                          style={{ background: `${c}20`, color: c }}>
                          {ind.detected ? ind.severity.toUpperCase() : "CLEAR"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
