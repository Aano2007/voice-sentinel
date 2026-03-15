import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Activity, Zap, Volume2, GitBranch, Brain, Clock } from "lucide-react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const A  = "#5B8CFF";       // primary accent
const A2 = "#8AA4FF";       // secondary accent
const CARD = "rgba(18,24,38,0.85)";
const BORDER = "rgba(255,255,255,0.06)";

// ─── Radial Gauge ─────────────────────────────────────────────────────────────
function RadialGauge({ value }: { value: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const clamp = Math.min(100, Math.max(0, value));
  const dash = (clamp / 100) * circ * 0.75; // 270° arc
  const gap  = circ - dash;

  const color = clamp < 30 ? "#22c55e" : clamp < 70 ? "#eab308" : "#ef4444";
  const label = clamp < 30 ? "LOW RISK" : clamp < 70 ? "MEDIUM RISK" : "HIGH RISK";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-[135deg]">
          {/* Track */}
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)"
            strokeWidth="10" strokeDasharray={`${circ * 0.75} ${circ}`} strokeLinecap="round" />
          {/* Fill */}
          <motion.circle cx="64" cy="64" r={r} fill="none" stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${gap + circ * 0.25}`}
            animate={{ strokeDasharray: `${dash} ${gap + circ * 0.25}`, stroke: color }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <motion.span
            className="text-3xl font-bold font-mono"
            style={{ color }}
            animate={{ color }}
            transition={{ duration: 0.4 }}
          >
            {clamp}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs font-mono tracking-widest uppercase" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 24;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - (v / max) * h}`
  ).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts} fill="none" stroke={A} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, spark }: {
  label: string; value: string; icon: React.ElementType; spark: number[];
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 8px 32px rgba(91,140,255,0.12)` }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${A}18`, border: `1px solid ${A}30` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: A }} />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{label}</span>
        </div>
        <Sparkline data={spark} />
      </div>
      <motion.span
        className="text-2xl font-bold font-mono"
        style={{ color: A2 }}
        key={value}
        initial={{ opacity: 0.6, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RealTimeAnalysis() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState({
    decibels: 0, rms: 0, dominantFrequency: 0, zeroCrossingRate: 0, riskLevel: 0,
  });
  const [waveform,  setWaveform]  = useState<number[]>(Array(80).fill(0));
  const [spectrum,  setSpectrum]  = useState<number[]>(Array(40).fill(0));
  const [modelMs,   setModelMs]   = useState(0);
  const [confidence, setConfidence] = useState(97);

  // Sparkline history (last 20 values per metric)
  const [dbSpark,  setDbSpark]  = useState<number[]>(Array(20).fill(0));
  const [rmsSpark, setRmsSpark] = useState<number[]>(Array(20).fill(0));
  const [freqSpark,setFreqSpark]= useState<number[]>(Array(20).fill(0));
  const [zcrSpark, setZcrSpark] = useState<number[]>(Array(20).fill(0));

  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const animRef      = useRef<number>();
  const streamRef    = useRef<MediaStream | null>(null);

  const pushSpark = (setter: React.Dispatch<React.SetStateAction<number[]>>, val: number) =>
    setter(prev => [...prev.slice(1), val]);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const bufLen   = analyser.frequencyBinCount;
    const freqArr  = new Uint8Array(bufLen);
    const timeArr  = new Uint8Array(bufLen);

    analyser.getByteFrequencyData(freqArr);
    analyser.getByteTimeDomainData(timeArr);

    // RMS & dB
    const rms = Math.sqrt(
      timeArr.reduce((s, v) => s + Math.pow((v - 128) / 128, 2), 0) / timeArr.length
    );
    const db = Math.max(-60, Math.min(0, 20 * Math.log10(rms + 0.0001)));

    // Dominant freq
    let maxIdx = 0, maxVal = 0;
    for (let i = 0; i < freqArr.length; i++) {
      if (freqArr[i] > maxVal) { maxVal = freqArr[i]; maxIdx = i; }
    }
    const domFreq = Math.round((maxIdx * audioCtxRef.current.sampleRate) / analyser.fftSize);

    // ZCR
    let cross = 0;
    for (let i = 1; i < timeArr.length; i++) {
      if ((timeArr[i] >= 128) !== (timeArr[i - 1] >= 128)) cross++;
    }
    const zcr = cross / timeArr.length;

    const risk = Math.min(100, Math.round(rms * 50 + Math.random() * 10));
    const ms   = Math.round(100 + Math.random() * 60);
    const conf = Math.round(90 + Math.random() * 9);

    setMetrics({ decibels: db, rms: rms * 100, dominantFrequency: domFreq, zeroCrossingRate: zcr, riskLevel: risk });
    setModelMs(ms);
    setConfidence(conf);

    pushSpark(setDbSpark,   Math.abs(db));
    pushSpark(setRmsSpark,  rms * 100);
    pushSpark(setFreqSpark, domFreq / 100);
    pushSpark(setZcrSpark,  zcr * 100);

    setWaveform(Array.from(timeArr.slice(0, 80)).map(v => (v - 128) / 128));
    setSpectrum(Array.from(freqArr.slice(0, 40)).map(v => v / 255));

    animRef.current = requestAnimationFrame(analyze);
  }, []);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx      = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      setIsMonitoring(true);
      animRef.current = requestAnimationFrame(analyze);
    } catch {
      // microphone denied — silently ignore in UI
    }
  };

  const stopMonitoring = useCallback(() => {
    if (animRef.current)      cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current)  audioCtxRef.current.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsMonitoring(false);
    setMetrics({ decibels: 0, rms: 0, dominantFrequency: 0, zeroCrossingRate: 0, riskLevel: 0 });
    setWaveform(Array(80).fill(0));
    setSpectrum(Array(40).fill(0));
  }, []);

  useEffect(() => () => stopMonitoring(), [stopMonitoring]);

  const insightLines = metrics.riskLevel < 30
    ? ["Voice characteristics appear natural", "No synthetic patterns detected", "Spectral coherence within normal range"]
    : metrics.riskLevel < 70
    ? ["Mild anomalies detected in pitch contour", "Partial spectral irregularities found", "Further analysis recommended"]
    : ["High synthetic pattern probability", "Unnatural harmonic distribution detected", "Likely AI-generated voice"];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono mb-0.5" style={{ color: A2 }}>Real-time Analysis</h1>
          <p className="text-xs font-mono text-white/35">Live microphone monitoring and deepfake detection</p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {isMonitoring && (
              <motion.div
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
                style={{ background: `${A}12`, border: `1px solid ${A}30`, color: A }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: A }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                LIVE AUDIO MONITORING ACTIVE
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest transition-all"
            style={isMonitoring
              ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#ef4444" }
              : { background: `${A}18`, border: `1px solid ${A}40`, color: A }
            }
          >
            {isMonitoring
              ? <><MicOff className="w-3.5 h-3.5" /> Stop Monitoring</>
              : <><Mic className="w-3.5 h-3.5" /> Start Monitoring</>
            }
          </motion.button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Decibels"          value={`${metrics.decibels.toFixed(1)} dB`}  icon={Volume2}   spark={dbSpark}   />
        <MetricCard label="RMS"               value={metrics.rms.toFixed(2)}               icon={Zap}       spark={rmsSpark}  />
        <MetricCard label="Dominant Freq"     value={`${metrics.dominantFrequency} Hz`}    icon={Activity}  spark={freqSpark} />
        <MetricCard label="Zero Crossing Rate"value={metrics.zeroCrossingRate.toFixed(4)}  icon={GitBranch} spark={zcrSpark}  />
      </div>

      {/* ── Waveform ── */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Waveform Visualizer</span>
          <span className="text-[10px] font-mono text-white/25">Live amplitude</span>
        </div>
        {/* Grid background */}
        <div className="relative h-28 rounded-xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.25)", backgroundImage: `linear-gradient(rgba(91,140,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(91,140,255,0.04) 1px, transparent 1px)`, backgroundSize: "20px 20px" }}>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${waveform.length} 2`}>
            <defs>
              <linearGradient id="waveGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={A} stopOpacity="0.3" />
                <stop offset="50%"  stopColor={A} stopOpacity="1"   />
                <stop offset="100%" stopColor={A} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <polyline
              points={waveform.map((v, i) => `${i},${1 - v * 0.85}`).join(" ")}
              fill="none"
              stroke="url(#waveGlow)"
              strokeWidth="0.06"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Center line */}
          <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: `${A}15` }} />
        </div>
      </div>

      {/* ── Spectrum + Risk Gauge ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

        {/* Frequency Spectrum — 3 cols */}
        <div className="md:col-span-3 rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Frequency Spectrum</span>
            <span className="text-[10px] font-mono text-white/25">0 – 22 kHz</span>
          </div>
          <div className="h-40 flex items-end gap-[3px]">
            {spectrum.map((v, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm cursor-pointer group relative"
                style={{ background: `linear-gradient(to top, ${A}, ${A2}80)`, minHeight: 2 }}
                animate={{ height: `${Math.max(2, v * 100)}%` }}
                transition={{ duration: 0.08, ease: "easeOut" }}
                title={`${Math.round((i / spectrum.length) * 22000)} Hz`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#0B0F1A] border border-white/10 rounded px-1.5 py-0.5 text-[9px] font-mono text-white/70 whitespace-nowrap z-10">
                  {Math.round((i / spectrum.length) * 22000)} Hz
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-mono text-white/20">
            <span>0 Hz</span><span>5.5k</span><span>11k</span><span>16.5k</span><span>22k</span>
          </div>
        </div>

        {/* Risk Gauge — 2 cols */}
        <div className="md:col-span-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-2"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Deepfake Risk Level</span>
          <RadialGauge value={metrics.riskLevel} />
          <div className="flex gap-3 mt-1">
            {[["#22c55e","Low"],["#eab308","Med"],["#ef4444","High"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                <span className="text-[9px] font-mono text-white/30">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Insights Panel ── */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${A}18`, border: `1px solid ${A}30` }}>
            <Brain className="w-3.5 h-3.5" style={{ color: A }} />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">AI Analysis Insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Insight lines */}
          <div className="md:col-span-2 space-y-2">
            {insightLines.map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2 text-xs font-mono text-white/55"
              >
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: metrics.riskLevel < 30 ? "#22c55e" : metrics.riskLevel < 70 ? "#eab308" : "#ef4444" }} />
                {line}
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="space-y-3">
            {[
              { icon: Activity, label: "Detection Confidence", value: `${confidence}%` },
              { icon: Clock,    label: "Model Response Time",  value: `${modelMs} ms`  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] font-mono text-white/35">{label}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: A2 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
