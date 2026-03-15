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

export interface VoiceCompareResult {
  similarity: number;
  verdict: "Same Speaker" | "Likely Same" | "Uncertain" | "Different Speaker";
  breakdown: {
    spectralCentroid: { a: number; b: number; score: number };
    zeroCrossingRate: { a: number; b: number; score: number };
    pitchVariation: { a: number; b: number; score: number };
    harmonicRatio: { a: number; b: number; score: number };
    energyProfile: { a: number; b: number; score: number };
  };
}

async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();
  return decoded;
}

function extractFeatures(buffer: AudioBuffer): {
  spectralCentroid: number;
  zeroCrossingRate: number;
  pitchVariation: number;
  harmonicRatio: number;
  energy: number;
} {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const frameSize = 2048;
  const frames = Math.floor(data.length / frameSize);

  let totalCentroid = 0;
  let totalZCR = 0;
  let totalEnergy = 0;
  const framePitches: number[] = [];
  const frameHarmonics: number[] = [];

  for (let f = 0; f < frames; f++) {
    const frame = data.slice(f * frameSize, (f + 1) * frameSize);

    // Energy
    const energy = frame.reduce((s, v) => s + v * v, 0) / frameSize;
    totalEnergy += energy;

    // Zero crossing rate
    let zcr = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0) !== (frame[i - 1] >= 0)) zcr++;
    }
    totalZCR += zcr / frameSize;

    // Spectral centroid via FFT approximation (magnitude spectrum)
    let weightedSum = 0;
    let magnitudeSum = 0;
    for (let i = 0; i < frameSize / 2; i++) {
      const re = frame[i * 2] ?? 0;
      const im = frame[i * 2 + 1] ?? 0;
      const mag = Math.sqrt(re * re + im * im);
      const freq = (i * sampleRate) / frameSize;
      weightedSum += freq * mag;
      magnitudeSum += mag;
    }
    totalCentroid += magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

    // Pitch estimation via autocorrelation
    let maxCorr = 0;
    let bestLag = 0;
    const minLag = Math.floor(sampleRate / 500);
    const maxLag = Math.floor(sampleRate / 60);
    for (let lag = minLag; lag < maxLag && lag < frameSize; lag++) {
      let corr = 0;
      for (let i = 0; i < frameSize - lag; i++) corr += frame[i] * frame[i + lag];
      if (corr > maxCorr) { maxCorr = corr; bestLag = lag; }
    }
    const pitch = bestLag > 0 ? sampleRate / bestLag : 0;
    if (pitch > 60 && pitch < 500) framePitches.push(pitch);

    // Harmonic ratio (ratio of energy in harmonic bands)
    const harmonicEnergy = frame.slice(0, frameSize / 4).reduce((s, v) => s + v * v, 0);
    const totalFrameEnergy = frame.reduce((s, v) => s + v * v, 0);
    frameHarmonics.push(totalFrameEnergy > 0 ? harmonicEnergy / totalFrameEnergy : 0);
  }

  const avgPitch = framePitches.length > 0 ? framePitches.reduce((a, b) => a + b, 0) / framePitches.length : 0;
  const pitchVariation = framePitches.length > 1
    ? Math.sqrt(framePitches.reduce((s, p) => s + (p - avgPitch) ** 2, 0) / framePitches.length)
    : 0;

  return {
    spectralCentroid: totalCentroid / frames,
    zeroCrossingRate: totalZCR / frames,
    pitchVariation,
    harmonicRatio: frameHarmonics.reduce((a, b) => a + b, 0) / frameHarmonics.length,
    energy: totalEnergy / frames,
  };
}

function featureSimilarity(a: number, b: number, tolerance: number): number {
  if (a === 0 && b === 0) return 100;
  const diff = Math.abs(a - b);
  const base = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.max(0, 100 - (diff / base) * tolerance * 100);
}

export async function compareVoices(file1: File, file2: File): Promise<VoiceCompareResult> {
  const [buf1, buf2] = await Promise.all([decodeAudioFile(file1), decodeAudioFile(file2)]);
  const f1 = extractFeatures(buf1);
  const f2 = extractFeatures(buf2);

  const centroidScore   = featureSimilarity(f1.spectralCentroid, f2.spectralCentroid, 1.5);
  const zcrScore        = featureSimilarity(f1.zeroCrossingRate,  f2.zeroCrossingRate,  2.0);
  const pitchScore      = featureSimilarity(f1.pitchVariation,    f2.pitchVariation,    1.8);
  const harmonicScore   = featureSimilarity(f1.harmonicRatio,     f2.harmonicRatio,     2.0);
  const energyScore     = featureSimilarity(f1.energy,            f2.energy,            1.5);

  // Weighted average — spectral centroid and pitch carry more weight
  const similarity = (
    centroidScore * 0.30 +
    zcrScore      * 0.15 +
    pitchScore    * 0.30 +
    harmonicScore * 0.15 +
    energyScore   * 0.10
  );

  const verdict: VoiceCompareResult["verdict"] =
    similarity >= 80 ? "Same Speaker" :
    similarity >= 65 ? "Likely Same" :
    similarity >= 45 ? "Uncertain" :
    "Different Speaker";

  return {
    similarity: Math.round(similarity * 10) / 10,
    verdict,
    breakdown: {
      spectralCentroid: { a: Math.round(f1.spectralCentroid), b: Math.round(f2.spectralCentroid), score: Math.round(centroidScore) },
      zeroCrossingRate: { a: Math.round(f1.zeroCrossingRate * 1000) / 1000, b: Math.round(f2.zeroCrossingRate * 1000) / 1000, score: Math.round(zcrScore) },
      pitchVariation:   { a: Math.round(f1.pitchVariation),   b: Math.round(f2.pitchVariation),   score: Math.round(pitchScore) },
      harmonicRatio:    { a: Math.round(f1.harmonicRatio * 100) / 100, b: Math.round(f2.harmonicRatio * 100) / 100, score: Math.round(harmonicScore) },
      energyProfile:    { a: Math.round(f1.energy * 1e6) / 1e6, b: Math.round(f2.energy * 1e6) / 1e6, score: Math.round(energyScore) },
    },
  };
}
