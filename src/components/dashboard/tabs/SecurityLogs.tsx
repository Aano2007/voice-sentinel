import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Clock,
  Search, Download, Eye, RefreshCw, Filter, FileText,
  ChevronDown, SlidersHorizontal,
} from "lucide-react";
import { AudioDatabase } from "@/lib/audioDatabase";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtDate(ts: number) {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(",", "");
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── sub-components ────────────────────────────────────────────────────────────
function ResultBadge({ label }: { label: string }) {
  const cfg: Record<string, { icon: React.ElementType; bg: string; border: string; text: string }> = {
    "Real Voice":        { icon: CheckCircle2,  bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#4ade80" },
    "Deepfake Detected": { icon: XCircle,       bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#f87171" },
    "Suspicious":        { icon: AlertTriangle, bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)",   text: "#facc15" },
  };
  const c = cfg[label] ?? { icon: Shield, bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)", text: "#a5b4fc" };
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

function ThreatBadge({ score }: { score: number }) {
  const cfg = score < 30
    ? { label: "Low",    bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)",  text: "#4ade80" }
    : score < 60
    ? { label: "Medium", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.25)",  text: "#facc15" }
    : { label: "High",   bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  text: "#f87171" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "#4ade80" : value >= 60 ? "#facc15" : "#f87171";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
      <span className="font-mono text-[11px] font-semibold w-12 text-right" style={{ color }}>{value.toFixed(1)}%</span>
    </div>
  );
}

function ActionMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all"
        style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", color: "#818cf8" }}>
        Actions <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1 w-44 rounded-xl overflow-hidden z-20"
            style={{ background: "rgba(13,16,24,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            {[
              { icon: Eye,        label: "View Analysis"   },
              { icon: Download,   label: "Download Report" },
              { icon: RefreshCw,  label: "Recheck"         },
            ].map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 font-mono text-[12px] transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.6)" }}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export function SecurityLogs() {
  const records = AudioDatabase.getAll();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | "low" | "medium" | "high">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => records.filter(r => {
    const matchSearch = r.fileName.toLowerCase().includes(search.toLowerCase()) ||
      r.result.label.toLowerCase().includes(search.toLowerCase());
    const score = r.result.riskScore;
    const matchFilter =
      filter === "all"    ? true :
      filter === "low"    ? score < 30 :
      filter === "medium" ? score >= 30 && score < 60 :
      score >= 60;
    return matchSearch && matchFilter;
  }), [records, search, filter]);

  const exportCSV = () => {
    const header = "Timestamp,File Name,Result,Threat Level,Confidence,Risk Score\n";
    const rows = filtered.map(r => {
      const threat = r.result.riskScore < 30 ? "Low" : r.result.riskScore < 60 ? "Medium" : "High";
      return `"${fmtDate(r.timestamp)}","${r.fileName}","${r.result.label}","${threat}","${r.result.confidence.toFixed(1)}%","${r.result.riskScore}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `security-logs-${Date.now()}.csv`; a.click();
  };

  const CARD = "rgba(15,18,28,0.9)";
  const BORDER = "rgba(255,255,255,0.06)";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold font-mono leading-tight" style={{ color: "#e8eaf0" }}>Security Logs</h1>
          <p className="text-sm font-mono mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Audit trail of all audio analyses · {records.length} total records
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all shrink-0"
          style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8" }}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by file name or result…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl font-mono text-sm outline-none transition-all"
            style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e8eaf0" }}
            onFocus={e => (e.target.style.borderColor = "rgba(129,140,248,0.4)")}
            onBlur={e => (e.target.style.borderColor = BORDER)} />
        </div>

        {/* Filter */}
        <div className="relative">
          <button onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-widest transition-all"
            style={{ background: CARD, border: `1px solid ${filter !== "all" ? "rgba(129,140,248,0.4)" : BORDER}`, color: filter !== "all" ? "#818cf8" : "rgba(255,255,255,0.4)" }}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {filter === "all" ? "All Threats" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Risk`}
            <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1 w-40 rounded-xl overflow-hidden z-20"
                style={{ background: "rgba(13,16,24,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                {(["all", "low", "medium", "high"] as const).map(f => (
                  <button key={f} onClick={() => { setFilter(f); setFilterOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 font-mono text-[12px] transition-colors hover:bg-white/5"
                    style={{ color: filter === f ? "#818cf8" : "rgba(255,255,255,0.5)" }}>
                    <Filter className="w-3 h-3" />
                    {f === "all" ? "All Threats" : `${f.charAt(0).toUpperCase() + f.slice(1)} Risk`}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-mono text-xs"
          style={{ background: CARD, border: `1px solid ${BORDER}`, color: "rgba(255,255,255,0.25)" }}>
          <FileText className="w-3.5 h-3.5" />
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                {["Timestamp", "File Name", "Detection Result", "Threat Level", "Confidence", "Action"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-mono text-[11px] uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.15)" }}>
                        <Shield className="w-6 h-6" style={{ color: "rgba(129,140,248,0.4)" }} />
                      </div>
                      <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {records.length === 0 ? "No analyses recorded yet" : "No results match your filters"}
                      </p>
                      <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
                        {records.length === 0 ? "Run a File Analysis or Real-time session to populate logs" : "Try adjusting your search or filter"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((record, i) => (
                  <motion.tr key={record.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(129,140,248,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {/* Timestamp */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
                        <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {fmtDate(record.timestamp)}
                        </span>
                      </div>
                    </td>
                    {/* File Name */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-mono text-[13px] font-medium truncate max-w-[160px]" style={{ color: "#e8eaf0" }}>{record.fileName}</p>
                        <p className="font-mono text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {fmtBytes(record.fileSize)} · {record.duration}s
                        </p>
                      </div>
                    </td>
                    {/* Result */}
                    <td className="px-5 py-4"><ResultBadge label={record.result.label} /></td>
                    {/* Threat */}
                    <td className="px-5 py-4"><ThreatBadge score={record.result.riskScore} /></td>
                    {/* Confidence */}
                    <td className="px-5 py-4"><ConfidenceBar value={record.result.confidence} /></td>
                    {/* Action */}
                    <td className="px-5 py-4"><ActionMenu id={record.id} /></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
