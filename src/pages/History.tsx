import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AudioDatabase, type AudioRecord } from "@/lib/audioDatabase";
import {
  Upload,
  Mic,
  ArrowLeft,
  Trash2,
  FileAudio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  HardDrive,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function History() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<AudioRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "upload" | "recording">("all");

  const allRecords = AudioDatabase.getAll();
  const uploadRecords = AudioDatabase.getByType("upload");
  const recordingRecords = AudioDatabase.getByType("recording");
  const stats = AudioDatabase.getStats();

  const getRecordsForTab = () => {
    switch (activeTab) {
      case "upload":
        return uploadRecords;
      case "recording":
        return recordingRecords;
      default:
        return allRecords;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    AudioDatabase.delete(id);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
    window.location.reload();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getResultColor = (label: string) => {
    switch (label) {
      case "Real Voice":
        return "text-green-500";
      case "Deepfake Detected":
        return "text-red-500";
      case "Suspicious":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getResultIcon = (label: string) => {
    switch (label) {
      case "Real Voice":
        return CheckCircle2;
      case "Deepfake Detected":
        return XCircle;
      case "Suspicious":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-primary hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold font-mono text-primary">ANALYSIS HISTORY</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-mono uppercase">Total Scans</div>
              <div className="text-xl font-bold font-mono text-primary">{stats.total}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Uploads", value: stats.uploads, icon: Upload, color: "text-blue-500" },
            { label: "Recordings", value: stats.recordings, icon: Mic, color: "text-purple-500" },
            { label: "Deepfakes", value: stats.deepfakes, icon: XCircle, color: "text-red-500" },
            { label: "Real Voices", value: stats.realVoices, icon: CheckCircle2, color: "text-green-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold font-mono">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-mono uppercase">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Records List */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-secondary/50 rounded-none border-b border-border">
                  <TabsTrigger value="all" className="font-mono">
                    All ({allRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="font-mono">
                    <Upload className="w-3 h-3 mr-1" />
                    Uploads ({uploadRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="recording" className="font-mono">
                    <Mic className="w-3 h-3 mr-1" />
                    Recordings ({recordingRecords.length})
                  </TabsTrigger>
                </TabsList>

                <div className="max-h-[600px] overflow-y-auto">
                  {getRecordsForTab().length === 0 ? (
                    <div className="p-8 text-center">
                      <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-mono">No records found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {getRecordsForTab().map((record) => {
                        const ResultIcon = getResultIcon(record.result.label);
                        return (
                          <motion.div
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setSelectedRecord(record)}
                            className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors ${
                              selectedRecord?.id === record.id ? "bg-secondary/50 border-l-4 border-primary" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {record.type === "upload" ? (
                                    <Upload className="w-4 h-4 text-blue-500 shrink-0" />
                                  ) : (
                                    <Mic className="w-4 h-4 text-purple-500 shrink-0" />
                                  )}
                                  <span className="text-sm font-mono font-semibold truncate">
                                    {record.fileName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(record.timestamp)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <ResultIcon className={`w-4 h-4 ${getResultColor(record.result.label)}`} />
                                  <span className={`text-xs font-mono font-bold ${getResultColor(record.result.label)}`}>
                                    {record.result.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {record.result.confidence.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(record.id, e)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Record Details */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedRecord ? (
                <motion.div
                  key={selectedRecord.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-secondary/50 border-b border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {selectedRecord.type === "upload" ? (
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-blue-500" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Mic className="w-6 h-6 text-purple-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-lg font-bold font-mono">{selectedRecord.fileName}</h2>
                        <p className="text-xs text-muted-foreground font-mono uppercase">
                          {selectedRecord.type === "upload" ? "Uploaded File" : "Voice Recording"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div>
                        <div className="text-muted-foreground mb-1">Duration</div>
                        <div className="font-bold">{formatDuration(selectedRecord.duration)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">File Size</div>
                        <div className="font-bold">{formatFileSize(selectedRecord.fileSize)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Analyzed</div>
                        <div className="font-bold">{formatDate(selectedRecord.timestamp)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Detection Result */}
                  <div className="p-6 border-b border-border">
                    <h3 className="text-xs font-mono text-muted-foreground uppercase mb-3">Detection Result</h3>
                    <div className="flex items-center gap-4 mb-4">
                      {(() => {
                        const ResultIcon = getResultIcon(selectedRecord.result.label);
                        return (
                          <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
                              selectedRecord.result.label === "Real Voice"
                                ? "bg-green-500/10 border-green-500/30"
                                : selectedRecord.result.label === "Deepfake Detected"
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-yellow-500/10 border-yellow-500/30"
                            }`}
                          >
                            <ResultIcon className={`w-8 h-8 ${getResultColor(selectedRecord.result.label)}`} />
                            <div>
                              <div className={`text-xl font-bold font-mono ${getResultColor(selectedRecord.result.label)}`}>
                                {selectedRecord.result.label}
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                Confidence: {selectedRecord.result.confidence.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground font-mono mb-1">Risk Score</div>
                        <div className="text-2xl font-bold font-mono text-primary">
                          {selectedRecord.result.riskScore.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground font-mono mb-1">Confidence</div>
                        <div className="text-2xl font-bold font-mono text-primary">
                          {selectedRecord.result.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Features */}
                  <div className="p-6 border-b border-border">
                    <h3 className="text-xs font-mono text-muted-foreground uppercase mb-3">Audio Features</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Spectral Centroid", value: `${selectedRecord.features.spectralCentroid.toFixed(0)} Hz` },
                        { label: "Zero Crossing Rate", value: selectedRecord.features.zeroCrossingRate.toFixed(4) },
                        { label: "Pitch Variation", value: `${selectedRecord.features.pitchVariation.toFixed(1)} Hz` },
                        { label: "Harmonic Ratio", value: selectedRecord.features.harmonicRatio.toFixed(3) },
                      ].map((feature) => (
                        <div key={feature.label} className="bg-secondary/30 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground font-mono mb-1">{feature.label}</div>
                          <div className="text-lg font-bold font-mono">{feature.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div className="p-6">
                    <h3 className="text-xs font-mono text-muted-foreground uppercase mb-3">Deepfake Indicators</h3>
                    <div className="space-y-2">
                      {selectedRecord.indicators.map((indicator) => (
                        <div
                          key={indicator.name}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            indicator.detected
                              ? indicator.severity === "high"
                                ? "bg-red-500/10 border-red-500/30"
                                : indicator.severity === "medium"
                                ? "bg-yellow-500/10 border-yellow-500/30"
                                : "bg-blue-500/10 border-blue-500/30"
                              : "bg-secondary/30 border-border"
                          }`}
                        >
                          {indicator.detected ? (
                            <AlertTriangle
                              className={`w-5 h-5 ${
                                indicator.severity === "high"
                                  ? "text-red-500"
                                  : indicator.severity === "medium"
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                              }`}
                            />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-mono font-semibold">{indicator.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {indicator.detected ? `${indicator.severity.toUpperCase()} SEVERITY` : "CLEAR"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border rounded-lg p-12 text-center"
                >
                  <FileAudio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-mono text-muted-foreground mb-2">No Record Selected</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    Select a record from the list to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
