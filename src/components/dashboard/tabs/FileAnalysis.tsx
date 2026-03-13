import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { analyzeAudio, type DetectionResult } from "@/lib/audioAnalysis";
import { AudioDatabase } from "@/lib/audioDatabase";

export function FileAnalysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      analyzeFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      analyzeFile(file);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ["audio/wav", "audio/mpeg", "audio/ogg", "audio/x-m4a", "audio/mp4"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|ogg|m4a)$/i)) {
      alert("Invalid file type. Please upload WAV, MP3, OGG, or M4A files.");
      return false;
    }

    if (file.size > maxSize) {
      alert("File size exceeds 10MB limit.");
      return false;
    }

    return true;
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysis = await analyzeAudio(file, 0);
    setResult(analysis);
    setIsAnalyzing(false);

    // Generate waveform data
    const waveform = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(waveform);

    // Save to database
    AudioDatabase.add({
      type: "upload",
      fileName: file.name,
      fileSize: file.size,
      duration: 30, // Simulated
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
  };

  const getResultIcon = () => {
    if (!result) return FileAudio;
    switch (result.label) {
      case "Real Voice":
        return CheckCircle2;
      case "Deepfake Detected":
        return XCircle;
      case "Suspicious":
        return AlertTriangle;
      default:
        return FileAudio;
    }
  };

  const getResultColor = () => {
    if (!result) return "text-muted-foreground";
    switch (result.label) {
      case "Real Voice":
        return "text-green-500";
      case "Deepfake Detected":
        return "text-red-500";
      case "Suspicious":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">File Analysis</h1>
        <p className="text-sm text-muted-foreground font-mono">Upload and analyze audio files for deepfake detection</p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <input
          type="file"
          accept=".wav,.mp3,.ogg,.m4a"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <h3 className="text-lg font-mono font-semibold mb-2">
          {isDragging ? "Drop file here" : "Drag and drop audio file"}
        </h3>
        <p className="text-sm text-muted-foreground font-mono mb-4">or click to browse</p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-mono">
          <span>WAV</span>
          <span>•</span>
          <span>MP3</span>
          <span>•</span>
          <span>OGG</span>
          <span>•</span>
          <span>M4A</span>
          <span>•</span>
          <span>Max 10MB</span>
        </div>
      </div>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-lg p-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-lg font-mono text-primary">Analyzing audio file...</p>
            <p className="text-sm text-muted-foreground font-mono mt-2">This may take a few moments</p>
          </motion.div>
        )}

        {result && uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* File Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <FileAudio className="w-12 h-12 text-primary" />
                <div className="flex-1">
                  <h3 className="text-lg font-mono font-semibold">{uploadedFile.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Waveform */}
              <div className="h-24 flex items-end gap-1 bg-secondary/30 rounded-lg p-4">
                {waveformData.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                    style={{ height: `${value * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Detection Result */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Detection Result</h3>
              <div className="flex items-center gap-4 mb-6">
                {(() => {
                  const ResultIcon = getResultIcon();
                  return (
                    <div
                      className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 ${
                        result.label === "Real Voice"
                          ? "bg-green-500/10 border-green-500/30"
                          : result.label === "Deepfake Detected"
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-yellow-500/10 border-yellow-500/30"
                      }`}
                    >
                      <ResultIcon className={`w-10 h-10 ${getResultColor()}`} />
                      <div>
                        <div className={`text-2xl font-bold font-mono ${getResultColor()}`}>
                          {result.label}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Confidence: {result.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground font-mono mb-1">Deepfake Probability</div>
                  <div className="text-3xl font-bold font-mono text-primary">
                    {result.riskScore.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground font-mono mb-1">Confidence Score</div>
                  <div className="text-3xl font-bold font-mono text-primary">
                    {result.confidence.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Spectrogram */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Spectrogram</h3>
              <div className="h-48 bg-secondary/30 rounded-lg overflow-hidden">
                {result.spectrogramData && (
                  <div className="grid grid-cols-32 h-full">
                    {result.spectrogramData.map((row, i) => (
                      <div key={i} className="flex flex-col">
                        {row.map((value, j) => (
                          <div
                            key={j}
                            className="flex-1"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${value})`,
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Threat Level */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Threat Level</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">Overall Threat</span>
                  <span className={`text-2xl font-bold font-mono ${getResultColor()}`}>
                    {result.riskScore < 30 ? "LOW" : result.riskScore < 60 ? "MEDIUM" : "HIGH"}
                  </span>
                </div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      result.riskScore < 30
                        ? "bg-green-500"
                        : result.riskScore < 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
