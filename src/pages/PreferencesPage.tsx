import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, BarChart3, Monitor, CheckCircle2, Volume2, Zap } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: d } }) };

const PREFS_KEY = "vg_preferences";

interface Prefs {
  autoAnalyze:        boolean;
  soundAlerts:        boolean;
  highRiskOnly:       boolean;
  showConfidence:     boolean;
  compactView:        boolean;
  analysisThreshold:  number;
  defaultTab:         string;
}

const defaults: Prefs = {
  autoAnalyze:       false,
  soundAlerts:       true,
  highRiskOnly:      false,
  showConfidence:    true,
  compactView:       false,
  analysisThreshold: 60,
  defaultTab:        "realtime",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-blue-500" : "bg-[#1e1e1e]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) setPrefs({ ...defaults, ...JSON.parse(stored) });
  }, []);

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setPrefs(defaults);
    localStorage.removeItem(PREFS_KEY);
    setSaved(false);
  };

  const tabs = [
    { value: "realtime",   label: "Real-time Analysis" },
    { value: "file",       label: "File Analysis" },
    { value: "analytics",  label: "Voice Analytics" },
    { value: "logs",       label: "Security Logs" },
    { value: "radar",      label: "Threat Radar" },
    { value: "statistics", label: "Statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-[#fafafa]">
      <div className="border-b border-[#1e1e1e] px-6 py-4 flex items-center gap-4 bg-[rgba(14,14,14,0.8)] backdrop-blur-xl sticky top-0 z-40">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-[#a3a3a3] hover:text-[#fafafa] transition-colors font-mono text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>

          <motion.div variants={fadeUp} custom={0}>
            <p className="section-label mb-2">Account</p>
            <h1 className="font-display text-2xl font-bold text-[#fafafa]">Preferences</h1>
            <p className="text-[#a3a3a3] text-sm mt-1">Customize how VoiceGuard AI behaves for you.</p>
          </motion.div>

          {/* Analysis settings */}
          <motion.div variants={fadeUp} custom={0.1} className="vg-card rounded-xl p-6 mt-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <h2 className="font-display text-sm font-bold text-[#fafafa]">Analysis</h2>
            </div>

            {[
              { key: "autoAnalyze"   as const, label: "Auto-analyze on upload",    desc: "Start analysis immediately when a file is dropped" },
              { key: "showConfidence"as const, label: "Show confidence scores",     desc: "Display AI confidence % alongside detection results" },
              { key: "highRiskOnly"  as const, label: "Alert on high risk only",    desc: "Only notify when risk score exceeds the threshold below" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4 py-3 border-b border-[#1e1e1e] last:border-0">
                <div>
                  <p className="font-mono text-sm text-[#fafafa]">{row.label}</p>
                  <p className="font-mono text-[10px] text-[#a3a3a3] mt-0.5">{row.desc}</p>
                </div>
                <Toggle checked={prefs[row.key] as boolean} onChange={(v) => update(row.key, v)} />
              </div>
            ))}

            {/* Threshold slider */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-mono text-sm text-[#fafafa]">Risk Alert Threshold</p>
                  <p className="font-mono text-[10px] text-[#a3a3a3]">Alert when risk score exceeds this value</p>
                </div>
                <span className="font-mono text-sm font-bold text-blue-400">{prefs.analysisThreshold}%</span>
              </div>
              <input
                type="range" min={10} max={95} step={5}
                value={prefs.analysisThreshold}
                onChange={(e) => update("analysisThreshold", Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[9px] text-[#a3a3a3] mt-1">
                <span>10% (Sensitive)</span><span>95% (Strict)</span>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={fadeUp} custom={0.2} className="vg-card rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-blue-400" />
              <h2 className="font-display text-sm font-bold text-[#fafafa]">Notifications</h2>
            </div>
            {[
              { key: "soundAlerts" as const, label: "Sound alerts", desc: "Play a sound when a deepfake is detected" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-[#fafafa]">{row.label}</p>
                  <p className="font-mono text-[10px] text-[#a3a3a3] mt-0.5">{row.desc}</p>
                </div>
                <Toggle checked={prefs[row.key] as boolean} onChange={(v) => update(row.key, v)} />
              </div>
            ))}
          </motion.div>

          {/* Display */}
          <motion.div variants={fadeUp} custom={0.3} className="vg-card rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-4 h-4 text-blue-400" />
              <h2 className="font-display text-sm font-bold text-[#fafafa]">Display</h2>
            </div>
            {[
              { key: "compactView" as const, label: "Compact view", desc: "Reduce spacing in dashboard cards and lists" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4 pb-4 border-b border-[#1e1e1e]">
                <div>
                  <p className="font-mono text-sm text-[#fafafa]">{row.label}</p>
                  <p className="font-mono text-[10px] text-[#a3a3a3] mt-0.5">{row.desc}</p>
                </div>
                <Toggle checked={prefs[row.key] as boolean} onChange={(v) => update(row.key, v)} />
              </div>
            ))}

            {/* Default tab */}
            <div>
              <p className="font-mono text-sm text-[#fafafa] mb-1">Default Dashboard Tab</p>
              <p className="font-mono text-[10px] text-[#a3a3a3] mb-3">Which tab opens when you land on the dashboard</p>
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update("defaultTab", t.value)}
                    className={`px-3 py-2 rounded-lg border font-mono text-xs text-left transition-all ${
                      prefs.defaultTab === t.value
                        ? "border-blue-500/60 bg-blue-500/10 text-blue-400"
                        : "border-[#1e1e1e] bg-white/5 text-[#a3a3a3] hover:border-blue-500/30 hover:text-[#fafafa]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Save */}
          <motion.div variants={fadeUp} custom={0.4} className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              {saved && <CheckCircle2 className="w-4 h-4" />}
              {saved ? "Saved!" : "Save Preferences"}
            </button>
            <button onClick={handleReset} className="btn-ghost text-xs py-3 px-5">
              Reset to Defaults
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
