import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Process {
  name: string;
  status: "safe" | "suspicious" | "dangerous";
  description: string;
}

export function SystemAnalysis() {
  const [isScanning, setIsScanning] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  const suspiciousProcesses: Process[] = [
    { name: "AudioManipulator.exe", status: "dangerous", description: "Known audio manipulation tool" },
    { name: "VoiceChanger.dll", status: "suspicious", description: "Voice modification library" },
    { name: "DeepVoice.sys", status: "dangerous", description: "AI voice synthesis driver" },
    { name: "AudioRecorder.exe", status: "safe", description: "Standard audio recording software" },
    { name: "MediaPlayer.exe", status: "safe", description: "Media playback application" },
  ];

  const startScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setProcesses([]);

    let index = 0;
    const interval = setInterval(() => {
      if (index < suspiciousProcesses.length) {
        setProcesses((prev) => [...prev, suspiciousProcesses[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanComplete(true);
      }
    }, 800);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return CheckCircle2;
      case "suspicious":
        return AlertTriangle;
      case "dangerous":
        return XCircle;
      default:
        return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-500";
      case "suspicious":
        return "text-yellow-500";
      case "dangerous":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const dangerousCount = processes.filter((p) => p.status === "dangerous").length;
  const suspiciousCount = processes.filter((p) => p.status === "suspicious").length;
  const safeCount = processes.filter((p) => p.status === "safe").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-primary mb-1">System Analysis</h1>
          <p className="text-sm text-muted-foreground font-mono">Scan for audio manipulation tools</p>
        </div>
        <Button
          onClick={startScan}
          disabled={isScanning}
          size="lg"
          className="bg-primary hover:bg-primary/90 font-mono"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Start Scan
            </>
          )}
        </Button>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-6 h-6 text-primary" />
            </motion.div>
            <span className="text-lg font-mono text-primary">Scanning system processes...</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{ width: `${(processes.length / suspiciousProcesses.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      {scanComplete && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Dangerous", value: dangerousCount, icon: XCircle, color: "text-red-500" },
            { label: "Suspicious", value: suspiciousCount, icon: AlertTriangle, color: "text-yellow-500" },
            { label: "Safe", value: safeCount, icon: CheckCircle2, color: "text-green-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs font-mono text-muted-foreground uppercase">{stat.label}</span>
              </div>
              <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detected Processes */}
      {processes.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/50 border-b border-border px-4 py-3">
            <h3 className="text-sm font-mono text-muted-foreground uppercase">Detected Processes</h3>
          </div>
          <div className="divide-y divide-border">
            {processes.map((process, index) => {
              const StatusIcon = getStatusIcon(process.status);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <StatusIcon className={`w-6 h-6 ${getStatusColor(process.status)} shrink-0 mt-1`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-mono font-semibold">{process.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            process.status === "dangerous"
                              ? "bg-red-500/20 text-red-500"
                              : process.status === "suspicious"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-green-500/20 text-green-500"
                          }`}
                        >
                          {process.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{process.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {scanComplete && dangerousCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-lg font-mono font-bold text-red-500 mb-2">Security Recommendations</h3>
              <ul className="space-y-2 text-sm font-mono text-muted-foreground">
                <li>• Remove or quarantine detected audio manipulation tools</li>
                <li>• Run a full system antivirus scan</li>
                <li>• Review recently installed applications</li>
                <li>• Enable real-time protection</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {scanComplete && dangerousCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-mono font-bold text-green-500 mb-2">System Clean</h3>
          <p className="text-sm font-mono text-muted-foreground">
            No dangerous audio manipulation tools detected
          </p>
        </motion.div>
      )}
    </div>
  );
}
