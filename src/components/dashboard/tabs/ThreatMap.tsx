import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, AlertTriangle } from "lucide-react";

interface ThreatLocation {
  id: number;
  lat: number;
  lng: number;
  city: string;
  country: string;
  threatLevel: "low" | "medium" | "high";
  detections: number;
}

export function ThreatMap() {
  const [threats, setThreats] = useState<ThreatLocation[]>([
    { id: 1, lat: 40.7128, lng: -74.006, city: "New York", country: "USA", threatLevel: "high", detections: 45 },
    { id: 2, lat: 51.5074, lng: -0.1278, city: "London", country: "UK", threatLevel: "medium", detections: 23 },
    { id: 3, lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan", threatLevel: "low", detections: 12 },
    { id: 4, lat: 48.8566, lng: 2.3522, city: "Paris", country: "France", threatLevel: "medium", detections: 31 },
    { id: 5, lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia", threatLevel: "low", detections: 8 },
    { id: 6, lat: 55.7558, lng: 37.6173, city: "Moscow", country: "Russia", threatLevel: "high", detections: 52 },
    { id: 7, lat: 39.9042, lng: 116.4074, city: "Beijing", country: "China", threatLevel: "medium", detections: 28 },
  ]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Threat Map</h1>
        <p className="text-sm text-muted-foreground font-mono">Global deepfake detection locations</p>
      </div>

      {/* Map Visualization */}
      <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Globe className="w-full h-full text-primary" />
        </div>
        <div className="relative h-96 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
            {threats.map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <div className={`w-16 h-16 rounded-full ${getThreatColor(threat.threatLevel)} opacity-20 absolute inset-0 m-auto animate-ping`} />
                <div className={`w-12 h-12 rounded-full ${getThreatColor(threat.threatLevel)} flex items-center justify-center cursor-pointer relative z-10 mx-auto`}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-mono font-semibold">{threat.city}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{threat.detections} detections</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Threat List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Threat Level</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground uppercase">Detections</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {threats.map((threat) => (
              <tr key={threat.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-mono">{threat.city}, {threat.country}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    threat.threatLevel === "high"
                      ? "bg-red-500/20 text-red-500"
                      : threat.threatLevel === "medium"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-green-500/20 text-green-500"
                  }`}>
                    {threat.threatLevel.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono font-bold text-primary">{threat.detections}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
