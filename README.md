# VoiceGuard AI — Audio Deepfake Detector

A full-stack AI-powered voice authentication system that detects synthetic, cloned, and deepfake audio in real time. Built with React, TypeScript, Firebase, and the Web Audio API.

## Features

- **Real-time Audio Analysis** — Live microphone monitoring with instant deepfake risk scoring
- **File Analysis** — Upload MP3, WAV, FLAC, OGG, or WebM files for deep inspection
- **AI Detection Engine** — Multi-layered signal processing across 6 detection indicators
- **Threat Radar** — Visual radar mapping of past detections by risk score
- **Voice Analytics** — Spectrograms, waveforms, frequency spectrum, and feature breakdowns
- **Security Logs** — Full history of all analyses with timestamps and verdicts
- **Firebase Auth** — Email/password and Google OAuth with persistent sessions
- **User Profiles** — Display name, profile photo upload to Firebase Storage
- **Preferences** — Customizable thresholds, alerts, and dashboard defaults

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Auth & DB | Firebase Auth + Firestore |
| Storage | Firebase Storage |
| Audio | Web Audio API (FFT, autocorrelation) |
| Charts | Recharts |
| Fonts | Orbitron, Sarpanch, JetBrains Mono |

## Getting Started

### Prerequisites

- Node.js v18+
- A Firebase project with Auth, Firestore, and Storage enabled

### Installation

```sh
# Clone the repository
git clone https://github.com/Aano2007/voice-sentinel.git

# Navigate to project directory
cd voice-sentinel

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Firebase credentials in .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Build for Production

```sh
npm run build
```

## Detection System

The engine analyzes multiple audio features simultaneously:

1. **Spectral Centroid** — Frequency brightness; AI voices have unnatural distributions
2. **Zero Crossing Rate** — Waveform sign changes; synthetic speech shows irregular patterns
3. **Pitch Variation** — Pitch delta over time; AI voices are too consistent or erratic
4. **Harmonic Ratio** — Harmonic-to-noise energy; AI voices show abnormal structures
5. **Spectral Contrast** — Frequency band contrast; AI voices have flatter profiles
6. **Formant Transitions** — Vowel resonance shifts; AI voices lack natural transitions

**Risk Classification:**
- `≥ 60` → Deepfake Detected (70–95% confidence)
- `35–59` → Suspicious (50–70% confidence)
- `< 35` → Real Voice (85–95% confidence)

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── tabs/          # RealTimeAnalysis, FileAnalysis, ThreatRadar, etc.
│   │   └── Navbar.tsx
│   └── ui/                # shadcn/ui components
├── context/
│   └── AuthContext.tsx
├── lib/
│   └── firebase.ts
├── pages/
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── SignIn.tsx
│   ├── CreateAccount.tsx
│   ├── ProfilePage.tsx
│   ├── SecurityPage.tsx
│   └── PreferencesPage.tsx
└── index.css
```

## License

MIT License

## Author

Built by [Aano2007](https://github.com/Aano2007) — focused on audio security and AI-generated media detection.
