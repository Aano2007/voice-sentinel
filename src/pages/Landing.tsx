import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  Radio, Upload, Brain, Search, CheckCircle,
  Zap, Shield, Mic, Lock, BarChart3,
  PhoneCall, FileAudio, Globe, Newspaper, UserCheck, AlertTriangle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Stone palette tokens
const S = {
  accent:     "#bcb8b1",
  accentLight:"#ccc9c3",
  accentDim:  "#6b6760",
  border:     "#2e2c29",
  borderDim:  "rgba(188,184,177,0.15)",
  bg:         "#0e0d0c",
  card:       "rgba(26,25,23,0.6)",
  fg:         "#f5f4f2",
  muted:      "#8a8680",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label justify-center mb-4">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`vg-card rounded-xl p-6 ${className}`}>{children}</div>;
}

// ─── Waveform ────────────────────────────────────────────────────────────────
function Waveform() {
  return (
    <div className="flex items-center justify-center gap-[3px] h-16 mt-10">
      {Array.from({ length: 52 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: `linear-gradient(to top, ${S.accentDim}, ${S.accent})`, originY: 1 }}
          animate={{ scaleY: [0.2, 1, 0.3, 0.8, 0.2] }}
          transition={{ duration: 1.4 + (i % 7) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
          initial={{ height: 40 }}
        />
      ))}
    </div>
  );
}

// ─── Grain ───────────────────────────────────────────────────────────────────
function Grain() {
  return (
    <svg className="pointer-events-none fixed inset-0 w-full h-full z-50" style={{ opacity: 0.018 }} aria-hidden>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Scroll progress ─────────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      className="fixed right-0 top-0 w-[2px] origin-top z-50"
      style={{ scaleY, height: "100vh", background: `linear-gradient(to bottom, ${S.accent}, ${S.accentDim})` }}
    />
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onGetStarted }: { onGetStarted: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md" style={{ borderBottom: `1px solid ${S.border}`, background: `${S.bg}cc` }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5" style={{ color: S.accent }} />
          <span className="font-display text-sm font-bold tracking-wider" style={{ color: S.fg }}>VoiceGuard AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[{ label: "How It Works", id: "how-it-works" }, { label: "Features", id: "features" }, { label: "Use Cases", id: "use-cases" }].map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} className="font-mono text-xs uppercase tracking-widest transition-colors" style={{ color: S.muted }} onMouseEnter={e => (e.currentTarget.style.color = S.fg)} onMouseLeave={e => (e.currentTarget.style.color = S.muted)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sign-in" className="btn-ghost text-xs py-2 px-4">Sign In</Link>
          <button onClick={onGetStarted} className="btn-outline text-xs py-2 px-4">Get Started</button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden cyber-grid">
      <div className="scan-line absolute inset-0 pointer-events-none" style={{ height: "30%" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 60%, rgba(188,184,177,0.06) 0%, transparent 70%)` }} />

      <motion.div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>

        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-8" style={{ color: S.accent, border: `1px solid ${S.borderDim}`, background: "rgba(188,184,177,0.05)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: S.accent }} />
            AI-Powered Deepfake Voice Detection
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ color: S.fg }}>
          Detect Deepfake Voices{" "}
          <span className="text-glow" style={{ color: S.accent }}>with AI Precision</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={fadeUp} className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: S.muted }}>
          VoiceGuard AI uses advanced neural analysis to identify synthetic and cloned voices in real time — protecting you from AI-generated audio fraud.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <button onClick={onGetStarted} className="btn-primary text-base px-8 py-4">Try Voice Detection →</button>
        </motion.div>

        {/* Waveform */}
        <motion.div variants={fadeUp} className="w-full max-w-2xl"><Waveform /></motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="mt-12 grid grid-cols-3 gap-8 w-full max-w-xl">
          {[{ value: "97.3%", label: "Detection Accuracy" }, { value: "<100ms", label: "Analysis Speed" }, { value: "6+", label: "AI Indicators" }].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-glow" style={{ color: S.accent }}>{s.value}</div>
              <div className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: S.muted }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  { num: "01", icon: Upload,      title: "Upload or Record",         desc: "Drop an audio file or record live voice directly in your browser." },
  { num: "02", icon: Brain,       title: "AI Analyzes Waveform",     desc: "Our neural engine dissects spectral patterns, pitch, and micro-artifacts." },
  { num: "03", icon: Search,      title: "Detect Deepfake Patterns", desc: "Six AI indicators flag synthetic signatures invisible to the human ear." },
  { num: "04", icon: CheckCircle, title: "Receive Authenticity Result", desc: "Get a confidence score and detailed breakdown in under 100 ms." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <SectionLabel>Process</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: S.fg }}>How It Works</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.1 } } }}>
              <Card className="h-full flex flex-col gap-4">
                <span className="font-mono text-xs tracking-widest" style={{ color: S.accentDim }}>{s.num}</span>
                <s.icon className="w-8 h-8" style={{ color: S.accent }} />
                <h3 className="font-display text-sm font-bold" style={{ color: S.fg }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: S.muted }}>{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Zap,      title: "Real-Time Detection",          desc: "Analyze live audio streams with sub-100 ms latency." },
  { icon: BarChart3,title: "Deepfake Audio Analysis",      desc: "Spectral and temporal fingerprinting across 6 AI indicators." },
  { icon: Brain,    title: "AI Voice Signature Detection", desc: "Identify cloned voices even with minimal training data." },
  { icon: Mic,      title: "Upload or Record",             desc: "Supports MP3, WAV, FLAC, and live microphone input." },
  { icon: Lock,     title: "Private Processing",           desc: "All inference runs locally — your audio never leaves your device." },
  { icon: Shield,   title: "97.3% Accuracy",               desc: "Validated against the latest GAN and diffusion-based voice models." },
];

function Features() {
  return (
    <section id="features" className="py-24 px-6" style={{ background: S.bg }}>
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: S.fg }}>Features</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.08 } } }}>
              <Card className="h-full flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(188,184,177,0.08)", border: `1px solid ${S.borderDim}` }}>
                  <f.icon className="w-5 h-5" style={{ color: S.accent }} />
                </div>
                <h3 className="font-display text-sm font-bold" style={{ color: S.fg }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: S.muted }}>{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Use Cases ────────────────────────────────────────────────────────────────
const useCases = [
  { icon: AlertTriangle, title: "Voice Scam Prevention",    desc: "Stop vishing attacks that impersonate family, banks, or executives." },
  { icon: PhoneCall,     title: "Business Call Verification",desc: "Authenticate callers in real time during sensitive transactions." },
  { icon: FileAudio,     title: "Audio Evidence Integrity", desc: "Verify recordings submitted as legal or journalistic evidence." },
  { icon: Globe,         title: "Social Media Monitoring",  desc: "Flag synthetic audio before it spreads as misinformation." },
  { icon: Newspaper,     title: "Journalist Security",      desc: "Confirm source authenticity for audio tips and leaked recordings." },
  { icon: UserCheck,     title: "Identity Verification",    desc: "Add a deepfake-detection layer to voice-based authentication flows." },
];

function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <SectionLabel>Applications</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: S.fg }}>Use Cases</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((u, i) => (
            <motion.div key={u.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.08 } } }}>
              <Card className="h-full flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(188,184,177,0.08)", border: `1px solid ${S.borderDim}` }}>
                  <u.icon className="w-5 h-5" style={{ color: S.accent }} />
                </div>
                <h3 className="font-display text-sm font-bold" style={{ color: S.fg }}>{u.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: S.muted }}>{u.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="py-24 px-6">
      <motion.div className="max-w-3xl mx-auto text-center vg-card border-glow rounded-2xl p-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <SectionLabel>Get Protected</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: S.fg }}>Protect Yourself from AI Voice Fraud</h2>
        <p className="mb-10 leading-relaxed" style={{ color: S.muted }}>
          Join thousands of individuals and organizations using VoiceGuard AI to stay ahead of synthetic voice threats.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/create-account" className="btn-primary">Create Free Account →</Link>
          <button onClick={onGetStarted} className="btn-ghost">Try Voice Detection →</button>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-8 px-6" style={{ borderTop: `1px solid ${S.border}` }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2" style={{ color: S.muted }}>
          <Radio className="w-4 h-4" style={{ color: S.accent }} />
          <span className="font-mono text-xs">VoiceGuard AI © 2025</span>
        </div>
        <span className="font-mono text-xs" style={{ color: S.muted }}>All audio processed locally — zero data exposure</span>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);
  const handleGetStarted = () => setShowLoading(true);
  const handleLoadingComplete = () => navigate("/sign-in");

  return (
    <>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div className="min-h-screen text-[#f5f4f2]" style={{ background: S.bg }}>
        <Grain />
        <ScrollProgress />
        <Navbar onGetStarted={handleGetStarted} />
        <Hero onGetStarted={handleGetStarted} />
        <HowItWorks />
        <Features />
        <UseCases />
        <CTASection onGetStarted={handleGetStarted} />
        <Footer />
      </div>
    </>
  );
}
