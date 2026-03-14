# VoiceGuard AI — Detection Engine Improvements

## Overview

The deepfake detection system has been upgraded from a simulation to a real audio analysis engine that processes actual signal data to identify AI-generated voices. This document outlines the technical improvements made to the detection pipeline.

## Key Improvements

### 1. Real Audio Signal Processing

The engine now performs genuine audio signal analysis using the Web Audio API:

#### Features Extracted

| Feature | Description | Why It Matters |
|---|---|---|
| **Spectral Centroid** | Weighted mean of frequency magnitudes | AI voices have unnatural frequency brightness |
| **Zero Crossing Rate** | Rate of waveform sign changes | Synthetic speech shows irregular ZCR patterns |
| **Pitch Variation** | Delta pitch across time windows | AI voices are too consistent or erratic |
| **Harmonic Ratio** | Harmonic-to-noise energy ratio | AI voices show abnormal harmonic structures |
| **Spectral Contrast** | Per-band peak vs valley difference | AI voices have flatter spectral profiles |
| **MFCC** | Mel-frequency cepstral coefficients | Standard voice fingerprinting technique |
| **Chroma Features** | Pitch class energy distribution | Captures tonal characteristics |

### 2. Detection Indicators

Six indicators are evaluated per analysis, each with a severity weight:

1. **Pitch Consistency** — Severity: High (+15)
   - Triggers when pitch variation < 15 Hz or > 120 Hz
   - AI voices are unnaturally flat or erratically pitched

2. **Harmonic Pattern** — Severity: Medium (+8)
   - Triggers when harmonic ratio > 0.85 or < 0.25
   - Abnormal harmonic-to-noise structures

3. **Speech Artifacts** — Severity: High (+15)
   - Triggers when ZCR < 0.01 or > 0.15
   - Identifies synthetic waveform artifacts

4. **Frequency Spikes** — Severity: Medium (+8)
   - Triggers when spectral centroid < 500 Hz or > 4500 Hz
   - Abnormal frequency distributions

5. **Breath Pattern** — Severity: Low (+5)
   - Detects missing low-frequency energy
   - AI voices lack natural breathing and sub-vocal noise

6. **Formant Transition** — Severity: Medium (+8)
   - Detects low spectral contrast variation
   - AI voices have unnatural vowel resonance shifts

### 3. Risk Scoring

```
risk_score = base_score + Σ(severity_weights of triggered indicators)

Classification:
  ≥ 60  →  Deepfake Detected   (confidence: 70–95%)
  35–59 →  Suspicious           (confidence: 50–70%)
  < 35  →  Real Voice           (confidence: 85–95%)
```

### 4. Real-time Processing Pipeline

1. Audio input (file upload or live microphone)
2. Decode to `AudioBuffer` via Web Audio API
3. Run FFT (Fast Fourier Transform) for frequency domain data
4. Extract time-domain features (ZCR, pitch via autocorrelation)
5. Compute spectral features (centroid, contrast, harmonics)
6. Score each indicator and sum weighted risk
7. Classify and return verdict with confidence

## Accuracy Notes

The multi-layered approach improves detection for:
- Text-to-Speech (TTS) systems
- Voice cloning and deepfake models
- Voice conversion pipelines
- Diffusion-based speech synthesizers

## Known Limitations

- Very high-quality AI voices (e.g. latest ElevenLabs, VALL-E) may partially evade detection
- Audio clips under 2 seconds may not provide sufficient feature data
- Heavy background noise can skew spectral features
- Unusual natural voices may occasionally trigger false positives

## Planned Improvements

1. On-device ML model (ONNX) for learned feature classification
2. Temporal analysis across longer audio windows
3. Speaker verification and voice biometric comparison
4. Integration with external deepfake detection APIs
5. Confidence calibration using labeled voice datasets
6. Database of known AI voice model signatures
