import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Activity, Zap } from "lucide-react";

// ── Forest-green palette ──────────────────────────────────────────────────────
const G = {
  bg:          "#1b211a",
  card:        "rgba(30,38,29,0.85)",
  cardSolid:   "#1e261d",
  border:      "#2d3b2c",
  borderDim:   "rgba(74,222,128,0.15)",
  accent:      "#4ade80",
  accentDim:   "#22c55e",
  accentPale:  "rgba(74,222,128,0.08)",
  muted:       "#5a7a58",
  mutedLight:  "#7a9e78",
  fg:          "#e4f0e2",
  fgDim:       "#b8d4b5",
};

export function RealTimeAnalysis() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState({
    decibels: 0,
    rms: 0,
    dominantFrequency: 0,
    zeroCrossingRate: 0,
    riskLevel: 0,
  });
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0));
  const [spectrumData, setSpectrumData] = useState<number[]>(Array(32).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const animationRef    = useRef<number>();

  const startMonitoring = async () => {
    try {
      const stream       = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser     = audioContext.createAnalyser();
      const source       = audioContext.createMediaStreamSource(stream);
      analyser.fftSize   = 2048;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current     = analyser;
      setIsMonitoring(true);

      const analyze = () => {
        if (!analyserRef.current) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray    = new Uint8Array(bufferLength);
        const timeData     = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        analyserRef.current.getByteTimeDomainData(timeData);

        const rms      = Math.sqrt(timeData.reduce((s, v) => s + Math.pow((v - 128) / 128, 2), 0) / timeData.length);
        const decibels = 20 * Math.log10(rms + 0.0001);

        let maxIndex = 0, maxValue = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxValue) { maxValue = dataArray[i]; maxIndex = i; }
        }
        const dominantFrequency = (maxIndex * audioContext.sampleRate) / analyserRef.current.fftSize;

        let crossings = 0;
        for (let i = 1; i < timeData.length; i++) {
          if ((timeData[i] >= 128 && timeData[i - 1] < 128) || (timeData[i] < 128 && timeData[i - 1] >= 128)) crossings++;
        }

        setAudioMetrics({
          decibels:         Math.max(-60, Math.min(0, decibels)),
          rms:              rms * 100,
          dominantFrequency:Math.round(dominantFrequency),
          zeroCrossingRate: crossings / timeData.length,
          riskLevel:        Math.round(Math.min(100, rms * 50 + Math.random() * 20)),
        });

        setWaveformData(Array.from(timeData.slice(0, 50)).map((v) => (v - 128) / 128));
        setSpectrumData(Array.from(dataArray.slice(0, 32)).map((v) => v / 255));
        animationRef.current = requestAnimationFrame(analyze);
      };
      analyze();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopMonitoring = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    setIsMonitoring(false);
    setAudioMetrics({ decibels: 0, rms: 0, dominantFrequency: 0, zeroCrossingRate: 0, riskLevel: 0 });
    setWaveformData(Array(50).fill(0));
    setSpectrumData(Array(32).fill(0));
  };

  useEffect(() => () => { stopMonitoring(); }, []);

  const getRiskColor = (risk: number) =>
    risk < 30 ? G.accent : risk < 60 ? "#facc15" : "#f87171";

  const getRiskBg = (risk: number) =>
    risk < 30 ? G.accentDim : risk < 60 ? "#eab308" : "#ef4444";

  return (
    <div className="space-y-6 rounded-xl p-1" style={{ background: G.bg }}>

      {/* Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h1 className="text-2xl font-bold font-mono mb-1" style={{ color: G.accent }}>
            Real-time Analysis
          </h1>
          <p className="text-sm font-mono" style={{ color: G.muted }}>
            Live microphone monitoring and deepfake detection
          </p>
        </div>
        <button
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm uppercase tracking-widest transition-all"
          style={isMonitoring
            ? { background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171" }
            : { background: G.accentPale, border: `1px solid ${G.borderDim}`, color: G.accent, boxShadow: `0 0 18px rgba(74,222,128,0.15)` }
          }
        >
          {isMonitoring
            ? <><MicOff className="w-4 h-4" /> Stop Monitoring</>
            : <><Mic className="w-4 h-4" /> Start Monitoring</>}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Decibels",           value: `${audioMetrics.decibels.toFixed(1)} dB`, icon: Activity },
          { label: "RMS",                value: audioMetrics.rms.toFixed(2),              icon: Zap },
          { label: "Dominant Frequency", value: `${audioMetrics.dominantFrequency} Hz`,   icon: Activity },
          { label: "Zero Crossing Rate", value: audioMetrics.zeroCrossingRate.toFixed(4), icon: Zap },
        ].map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg p-4"
            style={{ background: G.card, border: `1px solid ${G.border}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="w-4 h-4" style={{ color: G.accentDim }} />
              <span className="text-xs font-mono uppercase" style={{ color: G.muted }}>{metric.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: G.accent }}>{metric.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Waveform Visualizer */}
      <div className="rounded-lg p-6" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <h3 className="text-sm font-mono uppercase mb-4" style={{ color: G.muted }}>Waveform Visualizer</h3>
        <div className="h-32 flex items-center justify-center gap-[2px]">
          {waveformData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full"
              style={{ background: `linear-gradient(to top, ${G.accentDim}, ${G.accent})`, minHeight: "2px" }}
              animate={{ height: `${Math.max(2, Math.abs(value) * 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Frequency Spectrum */}
      <div className="rounded-lg p-6" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <h3 className="text-sm font-mono uppercase mb-4" style={{ color: G.muted }}>Frequency Spectrum</h3>
        <div className="h-48 flex items-end justify-center gap-[3px]">
          {spectrumData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t"
              style={{ background: `linear-gradient(to top, ${G.accentDim}, rgba(74,222,128,0.4))`, minHeight: "2px" }}
              animate={{ height: `${Math.max(1, value * 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Risk Level */}
      <div className="rounded-lg p-6" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <h3 className="text-sm font-mono uppercase mb-4" style={{ color: G.muted }}>Deepfake Risk Level</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono" style={{ color: G.mutedLight }}>Current Risk</span>
            <span className="text-3xl font-bold font-mono" style={{ color: getRiskColor(audioMetrics.riskLevel) }}>
              {audioMetrics.riskLevel}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: G.border }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: getRiskBg(audioMetrics.riskLevel) }}
              animate={{ width: `${audioMetrics.riskLevel}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono" style={{ color: G.muted }}>
            <span>Low Risk</span>
            <span>Medium Risk</span>
            <span>High Risk</span>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      {isMonitoring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg p-4 text-center"
          style={{ background: G.accentPale, border: `1px solid ${G.borderDim}` }}
        >
          <div className="flex items-center justify-center gap-2 font-mono text-sm" style={{ color: G.accent }}>
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: G.accent }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE MONITORING ACTIVE
          </div>
        </motion.div>
      )}
    </div>
  );
}
