// Mock AI Audio Analysis Engine
// Simulates deepfake detection with realistic feature extraction results

export interface AudioFeatures {
  mfcc: number[];
  spectralCentroid: number;
  zeroCrossingRate: number;
  pitchVariation: number;
  harmonicRatio: number;
  spectralContrast: number[];
  chromaFeatures: number[];
  tonnetz: number[];
}

export interface DetectionResult {
  label: "Real Voice" | "Deepfake Detected" | "Suspicious";
  confidence: number;
  riskScore: number;
  features: AudioFeatures;
  indicators: DeepfakeIndicator[];
  spectrogramData: number[][];
  timelinePoint: { time: number; probability: number };
}

export interface DeepfakeIndicator {
  name: string;
  detected: boolean;
  severity: "low" | "medium" | "high";
  description: string;
}

function generateMFCC(): number[] {
  return Array.from({ length: 13 }, () => (Math.random() - 0.5) * 40);
}

function generateSpectrogramData(): number[][] {
  const rows = 64;
  const cols = 128;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => {
      const freq = Math.sin(i / 8) * Math.cos(j / 16) * 0.5;
      const noise = (Math.random() - 0.5) * 0.3;
      return Math.max(0, Math.min(1, 0.5 + freq + noise));
    })
  );
}

function generateIndicators(isDeepfake: boolean): DeepfakeIndicator[] {
  const allIndicators: DeepfakeIndicator[] = [
    {
      name: "Pitch Consistency",
      detected: isDeepfake ? Math.random() > 0.3 : Math.random() > 0.85,
      severity: "high",
      description: "Unnatural pitch shifts detected in voice pattern",
    },
    {
      name: "Harmonic Pattern",
      detected: isDeepfake ? Math.random() > 0.4 : Math.random() > 0.9,
      severity: "medium",
      description: "Inconsistent harmonic patterns suggest synthesis",
    },
    {
      name: "Speech Artifacts",
      detected: isDeepfake ? Math.random() > 0.2 : Math.random() > 0.95,
      severity: "high",
      description: "Synthetic speech artifacts found in waveform",
    },
    {
      name: "Frequency Spikes",
      detected: isDeepfake ? Math.random() > 0.5 : Math.random() > 0.88,
      severity: "medium",
      description: "Abnormal frequency spikes in spectral analysis",
    },
    {
      name: "Breath Pattern",
      detected: isDeepfake ? Math.random() > 0.6 : Math.random() > 0.92,
      severity: "low",
      description: "Missing or artificial breathing patterns",
    },
    {
      name: "Formant Transition",
      detected: isDeepfake ? Math.random() > 0.35 : Math.random() > 0.9,
      severity: "medium",
      description: "Abnormal formant transitions between phonemes",
    },
  ];
  return allIndicators;
}

let analysisCounter = 0;

/** Simulates AI deepfake detection analysis */
export function analyzeAudio(timeOffset: number = 0): DetectionResult {
  analysisCounter++;
  
  // Create varied but somewhat consistent results
  const seed = Math.sin(analysisCounter * 0.7) * 0.5 + 0.5;
  const isDeepfake = seed > 0.55;
  const isSuspicious = !isDeepfake && seed > 0.4;

  let confidence: number;
  let riskScore: number;
  let label: DetectionResult["label"];

  if (isDeepfake) {
    confidence = 75 + Math.random() * 22;
    riskScore = 65 + Math.random() * 30;
    label = "Deepfake Detected";
  } else if (isSuspicious) {
    confidence = 55 + Math.random() * 20;
    riskScore = 35 + Math.random() * 25;
    label = "Suspicious";
  } else {
    confidence = 80 + Math.random() * 18;
    riskScore = 5 + Math.random() * 25;
    label = "Real Voice";
  }

  const features: AudioFeatures = {
    mfcc: generateMFCC(),
    spectralCentroid: 1500 + Math.random() * 2000,
    zeroCrossingRate: 0.02 + Math.random() * 0.08,
    pitchVariation: 20 + Math.random() * 80,
    harmonicRatio: 0.3 + Math.random() * 0.6,
    spectralContrast: Array.from({ length: 7 }, () => Math.random() * 50),
    chromaFeatures: Array.from({ length: 12 }, () => Math.random()),
    tonnetz: Array.from({ length: 6 }, () => (Math.random() - 0.5) * 2),
  };

  return {
    label,
    confidence: Math.round(confidence * 10) / 10,
    riskScore: Math.round(riskScore * 10) / 10,
    features,
    indicators: generateIndicators(isDeepfake),
    spectrogramData: generateSpectrogramData(),
    timelinePoint: {
      time: timeOffset,
      probability: isDeepfake ? 60 + Math.random() * 35 : 5 + Math.random() * 30,
    },
  };
}

export function resetAnalysis() {
  analysisCounter = 0;
}
