import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/dashboard/Navbar";
import { AudioInput } from "@/components/dashboard/AudioInput";
import { DetectionResultCard } from "@/components/dashboard/DetectionResult";
import { RiskMeter } from "@/components/dashboard/RiskMeter";
import { FeatureAnalysis } from "@/components/dashboard/FeatureAnalysis";
import { SpectrogramView } from "@/components/dashboard/SpectrogramView";
import { DeepfakeIndicators } from "@/components/dashboard/DeepfakeIndicators";
import { DetectionTimeline } from "@/components/dashboard/DetectionTimeline";
import { analyzeAudio, resetAnalysis, type DetectionResult } from "@/lib/audioAnalysis";
import { AudioDatabase } from "@/lib/audioDatabase";
import { Activity, Brain, BarChart3, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timelineData, setTimelineData] = useState<{ time: number; probability: number }[]>([]);
  const [currentAudioFile, setCurrentAudioFile] = useState<File | Blob | null>(null);
  const [currentAudioSource, setCurrentAudioSource] = useState<"upload" | "recording" | null>(null);
  const timeRef = useRef(0);

  const handleAnalyze = useCallback((source: "upload" | "recording", audioFile?: File | Blob) => {
    setIsAnalyzing(true);
    setTimelineData([]);
    resetAnalysis();
    timeRef.current = 0;
    setCurrentAudioSource(source);
    if (audioFile) {
      setCurrentAudioFile(audioFile);
    }

    // Simulate progressive analysis
    const steps = 6 + Math.floor(Math.random() * 4);
    let step = 0;

    const interval = setInterval(async () => {
      step++;
      timeRef.current += 0.5;
      const analysis = await analyzeAudio(audioFile || null, timeRef.current);
      setTimelineData((prev) => [...prev, analysis.timelinePoint]);

      if (step >= steps) {
        clearInterval(interval);
        setResult(analysis);
        setIsAnalyzing(false);
        
        // Save to database
        if (audioFile) {
          const fileName = audioFile instanceof File ? audioFile.name : `recording-${Date.now()}.webm`;
          const fileSize = audioFile.size;
          const duration = Math.floor(timeRef.current);
          
          AudioDatabase.add({
            type: source,
            fileName,
            fileSize,
            duration,
            result: {
              label: analysis.label,
              confidence: analysis.confidence,
              riskScore: analysis.riskScore,
            },
            features: {
              spectralCentroid: analysis.features.spectralCentroid,
              zeroCrossingRate: analysis.features.zeroCrossingRate,
              pitchVariation: analysis.features.pitchVariation,
              harmonicRatio: analysis.features.harmonicRatio,
            },
            indicators: analysis.indicators.map((ind) => ({
              name: ind.name,
              detected: ind.detected,
              severity: ind.severity,
            })),
          });
        }
      }
    }, 400);
  }, []);

  const handleRecordingChunk = useCallback(async () => {
    timeRef.current += 0.5;
    const analysis = await analyzeAudio(null, timeRef.current);
    setTimelineData((prev) => [...prev, analysis.timelinePoint]);
    setResult(analysis);
  }, []);

  const handleExportReport = useCallback(() => {
    if (!result) return;
    const report = `
═══════════════════════════════════════════
  AUDIO DEEPFAKE DETECTION REPORT
  Generated: ${new Date().toISOString()}
═══════════════════════════════════════════

DETECTION RESULT: ${result.label}
CONFIDENCE: ${result.confidence}%
RISK SCORE: ${result.riskScore}/100

───── Audio Features ─────
Spectral Centroid: ${result.features.spectralCentroid.toFixed(0)} Hz
Zero Crossing Rate: ${result.features.zeroCrossingRate.toFixed(4)}
Pitch Variation: ${result.features.pitchVariation.toFixed(1)} Hz
Harmonic Ratio: ${result.features.harmonicRatio.toFixed(3)}

MFCC Coefficients: ${result.features.mfcc.map((v) => v.toFixed(2)).join(", ")}

───── Deepfake Indicators ─────
${result.indicators.map((i) => `[${i.detected ? "⚠" : "✓"}] ${i.name}: ${i.detected ? i.severity.toUpperCase() : "CLEAR"} — ${i.description}`).join("\n")}

───── AI Analysis ─────
${result.label === "Real Voice" ? "The audio sample exhibits natural speech characteristics consistent with human voice production. No significant synthetic artifacts detected." : result.label === "Deepfake Detected" ? "WARNING: The audio sample exhibits characteristics consistent with AI-generated or manipulated speech. Multiple synthetic artifacts and unnatural patterns detected." : "CAUTION: The audio sample shows some anomalous patterns that warrant further investigation. Results are inconclusive."}

═══════════════════════════════════════════
  Report generated by Audio Deepfake Detector
  AI Voice Authentication System v1.0
═══════════════════════════════════════════
`.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deepfake-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Activity, label: "System Status", value: "Active", color: "text-success" },
            { icon: Brain, label: "AI Model", value: "CNN-LSTM v2", color: "text-info" },
            { icon: BarChart3, label: "Analyses", value: timelineData.length.toString(), color: "text-primary" },
            { icon: FileText, label: "Accuracy", value: "97.3%", color: "text-warning" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</span>
              </div>
              <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Audio Input */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Audio Input
              </h3>
              <AudioInput
                onAnalyze={handleAnalyze}
                onRecordingChunk={handleRecordingChunk}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Deepfake Indicators */}
            <DeepfakeIndicators indicators={result?.indicators ?? null} />
          </div>

          {/* Right Panel - Results & Analytics */}
          <div className="lg:col-span-8 space-y-4">
            {/* Detection Result */}
            <DetectionResultCard result={result} isAnalyzing={isAnalyzing} />

            {/* Risk Meter + Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RiskMeter riskScore={result?.riskScore ?? 0} />
              <DetectionTimeline data={timelineData} />
            </div>

            {/* Spectrogram */}
            <SpectrogramView data={result?.spectrogramData ?? null} />

            {/* Feature Analysis */}
            <FeatureAnalysis features={result?.features ?? null} />

            {/* Export */}
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  onClick={handleExportReport}
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Analysis Report
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
