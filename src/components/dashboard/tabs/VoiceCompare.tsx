import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Users, CheckCircle2, XCircle, AlertTriangle, HelpCircle, FileAudio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compareVoices, type VoiceCompareResult } from "@/lib/audioAnalysis";

const METRICS = [
  { key: "spectralCentroid", label: "Spectral Centroid", unit: "Hz",  desc: "Average frequency energy center" },
  { key: "zeroCrossingRate", label: "Zero Crossing Rate", unit: "",   desc: "Signal sign-change frequency" },
  { key: "pitchVariation",   label: "Pitch Variation",   unit: "Hz",  desc: "Vocal pitch consistency" },
  { key: "harmonicRatio",    label: "Harmonic Ratio",    unit: "",    desc: "Harmonic vs noise energy" },
  { key: "energyProfile",    label: "Energy Profile",    unit: "",    desc: "Overall signal energy" },
] as const;

function UploadBox({ label, file, onFile }: { label: string; file: File | null; onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false);
  const id = `vc-${label.replace(/\s/g, "")}`;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
        drag ? "border-primary bg-primary/10 scale-[1.02]" :
        file ? "border-primary/50 bg-primary/5" :
        "border-border hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <input type="file" accept="audio/*" id={id} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <FileAudio className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-mono text-foreground font-semibold truncate max-w-full px-2">{file.name}</p>
          <p className="text-xs font-mono text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">Click to replace</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-mono text-muted-foreground">{label}</p>
          <p className="text-xs font-mono text-muted-foreground/60">WAV · MP3 · OGG · M4A</p>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono font-bold w-10 text-right" style={{ color }}>{score}%</span>
    </div>
  );
}

export function VoiceCompare() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<VoiceCompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await compareVoices(file1, file2);
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to analyze audio. Ensure files are valid audio.");
    } finally {
      setLoading(false);
    }
  };

  const verdictConfig = result ? {
    "Same Speaker":       { icon: CheckCircle2,  color: "#22c55e", bg: "bg-green-500/10",  border: "border-green-500/30",  glow: "0 0 24px rgba(34,197,94,0.2)"  },
    "Likely Same":        { icon: CheckCircle2,  color: "#86efac", bg: "bg-green-400/10",  border: "border-green-400/30",  glow: "0 0 24px rgba(134,239,172,0.2)" },
    "Uncertain":          { icon: HelpCircle,    color: "#f59e0b", bg: "bg-yellow-500/10", border: "border-yellow-500/30", glow: "0 0 24px rgba(245,158,11,0.2)"  },
    "Different Speaker":  { icon: XCircle,       color: "#ef4444", bg: "bg-red-500/10",    border: "border-red-500/30",    glow: "0 0 24px rgba(239,68,68,0.2)"   },
  }[result.verdict] : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Voice Comparison</h1>
        <p className="text-sm text-muted-foreground font-mono">
          Upload two audio files — AI extracts real acoustic features to determine if they're the same speaker
        </p>
      </div>

      {/* Upload Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Voice Sample A</p>
          <UploadBox label="Drop or click to upload" file={file1} onFile={setFile1} />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Voice Sample B</p>
          <UploadBox label="Drop or click to upload" file={file2} onFile={setFile2} />
        </div>
      </div>

      {/* Compare Button */}
      <Button
        onClick={handleCompare}
        disabled={!file1 || !file2 || loading}
        className="w-full h-12 bg-primary hover:bg-primary/90 font-mono text-sm uppercase tracking-widest"
        size="lg"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Audio Features...</>
        ) : (
          <><Users className="w-4 h-4 mr-2" /> Compare Voices</>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm font-mono text-red-400">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {result && verdictConfig && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Verdict Hero Card */}
            <motion.div
              className={`rounded-xl border-2 p-6 ${verdictConfig.bg} ${verdictConfig.border}`}
              style={{ boxShadow: verdictConfig.glow }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${verdictConfig.color}18`, border: `2px solid ${verdictConfig.color}40` }}>
                  <verdictConfig.icon className="w-8 h-8" style={{ color: verdictConfig.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Verdict</p>
                  <h2 className="text-2xl font-bold font-mono" style={{ color: verdictConfig.color }}>
                    {result.verdict}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Similarity</p>
                  <p className="text-4xl font-bold font-mono" style={{ color: verdictConfig.color }}>
                    {result.similarity}%
                  </p>
                </div>
              </div>

              {/* Big progress bar */}
              <div className="mt-5">
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${verdictConfig.color}99, ${verdictConfig.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${result.similarity}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">0% — No Match</span>
                  <span className="text-[10px] font-mono text-muted-foreground">100% — Identical</span>
                </div>
              </div>
            </motion.div>

            {/* Feature Breakdown */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                Acoustic Feature Breakdown
              </p>
              <div className="space-y-4">
                {METRICS.map(({ key, label, unit, desc }, i) => {
                  const row = result.breakdown[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="grid grid-cols-[1fr_auto_auto_2fr] items-center gap-4"
                    >
                      <div>
                        <p className="text-xs font-mono text-foreground font-medium">{label}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-muted-foreground">A</p>
                        <p className="text-xs font-mono text-foreground">{row.a}{unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-muted-foreground">B</p>
                        <p className="text-xs font-mono text-foreground">{row.b}{unit}</p>
                      </div>
                      <ScoreBar score={row.score} />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Interpretation</p>
              <p className="text-sm font-mono text-foreground/80 leading-relaxed">
                {result.verdict === "Same Speaker" &&
                  "All acoustic features are highly consistent. The two audio samples are very likely from the same speaker recorded under similar conditions."}
                {result.verdict === "Likely Same" &&
                  "Most acoustic features align closely. The samples are probably from the same speaker, though minor differences may be due to recording conditions or emotional state."}
                {result.verdict === "Uncertain" &&
                  "Acoustic features show partial overlap. The samples may be from the same speaker under very different conditions, or from speakers with similar vocal characteristics."}
                {result.verdict === "Different Speaker" &&
                  "Significant differences detected across multiple acoustic features. The two audio samples are very likely from different speakers."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
