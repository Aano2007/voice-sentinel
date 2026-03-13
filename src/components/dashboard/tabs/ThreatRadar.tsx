import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radar, Activity } from "lucide-react";

export function ThreatRadar() {
  const [threats, setThreats] = useState<Array<{ angle: number; distance: number; intensity: number }>>([]);
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    // Generate random threats
    const generateThreats = () => {
      return Array.from({ length: 8 }, () => ({
        angle: Math.random() * 360,
        distance: Math.random() * 80 + 20,
        intensity: Math.random(),
      }));
    };

    setThreats(generateThreats());

    const interval = setInterval(() => {
      setThreats(generateThreats());
    }, 3000);

    const scanInterval = setInterval(() => {
      setScanAngle((prev) => (prev + 2) % 360);
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(scanInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Threat Radar</h1>
        <p className="text-sm text-muted-foreground font-mono">Real-time threat detection visualization</p>
      </div>

      {/* Radar Display */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="relative w-full aspect-square max-w-2xl mx-auto">
          {/* Radar circles */}
          {[25, 50, 75, 100].map((size) => (
            <div
              key={size}
              className="absolute inset-0 m-auto rounded-full border border-primary/20"
              style={{ width: `${size}%`, height: `${size}%` }}
            />
          ))}

          {/* Radar lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <div
              key={angle}
              className="absolute top-1/2 left-1/2 w-1/2 h-px bg-primary/20 origin-left"
              style={{ transform: `rotate(${angle}deg)` }}
            />
          ))}

          {/* Scanning beam */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
            style={{
              background: "linear-gradient(to right, rgba(59, 130, 246, 0.8), transparent)",
              height: "2px",
            }}
            animate={{ rotate: scanAngle }}
            transition={{ duration: 0.05, ease: "linear" }}
          />

          {/* Threat points */}
          {threats.map((threat, i) => {
            const x = Math.cos((threat.angle * Math.PI) / 180) * threat.distance;
            const y = Math.sin((threat.angle * Math.PI) / 180) * threat.distance;
            return (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  transform: `translate(${x}%, ${y}%)`,
                }}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    threat.intensity > 0.7
                      ? "bg-red-500"
                      : threat.intensity > 0.4
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-current opacity-30 absolute -inset-1.5 animate-ping" />
                </div>
              </motion.div>
            );
          })}

          {/* Center point */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-primary border-2 border-background" />
        </div>
      </div>

      {/* Threat Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Threats", value: threats.filter((t) => t.intensity > 0.7).length, color: "text-red-500" },
          { label: "Monitoring", value: threats.filter((t) => t.intensity > 0.4 && t.intensity <= 0.7).length, color: "text-yellow-500" },
          { label: "Clear", value: threats.filter((t) => t.intensity <= 0.4).length, color: "text-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs font-mono text-muted-foreground uppercase">{stat.label}</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-primary font-mono text-sm">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          SCANNING IN PROGRESS
        </div>
      </div>
    </div>
  );
}
