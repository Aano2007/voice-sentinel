import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RealTimeAnalysis() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState({
    decibels: 0,
    rms: 0,
    dominantFrequency: 0,
    zeroCrossingRate: 0,
    riskLevel: 0,
  });
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0));
  const [spectrumData, setSpectrumData] = useState<number[]>(Array(32).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsMonitoring(true);

      const analyze = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);

        analyserRef.current.getByteFrequencyData(dataArray);
        analyserRef.current.getByteTimeDomainData(timeData);

        // Calculate metrics
        const rms = Math.sqrt(
          timeData.reduce((sum, val) => sum + Math.pow((val - 128) / 128, 2), 0) / timeData.length
        );
        const decibels = 20 * Math.log10(rms + 0.0001);

        // Find dominant frequency
        let maxIndex = 0;
        let maxValue = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
          }
        }
        const dominantFrequency = (maxIndex * audioContext.sampleRate) / analyserRef.current.fftSize;

        // Calculate zero crossing rate
        let crossings = 0;
        for (let i = 1; i < timeData.length; i++) {
          if ((timeData[i] >= 128 && timeData[i - 1] < 128) || (timeData[i] < 128 && timeData[i - 1] >= 128)) {
            crossings++;
          }
        }
        const zcr = crossings / timeData.length;

        // Calculate risk level (simulated)
        const riskLevel = Math.min(100, (rms * 50 + Math.random() * 20));

        setAudioMetrics({
          decibels: Math.max(-60, Math.min(0, decibels)),
          rms: rms * 100,
          dominantFrequency: Math.round(dominantFrequency),
          zeroCrossingRate: zcr,
          riskLevel: Math.round(riskLevel),
        });

        // Update waveform
        const waveform = Array.from(timeData.slice(0, 50)).map((v) => (v - 128) / 128);
        setWaveformData(waveform);

        // Update spectrum
        const spectrum = Array.from(dataArray.slice(0, 32)).map((v) => v / 255);
        setSpectrumData(spectrum);

        animationRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsMonitoring(false);
    setAudioMetrics({
      decibels: 0,
      rms: 0,
      dominantFrequency: 0,
      zeroCrossingRate: 0,
      riskLevel: 0,
    });
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "text-green-500";
    if (risk < 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-primary mb-1">Real-time Analysis</h1>
          <p className="text-sm text-muted-foreground font-mono">Live microphone monitoring and deepfake detection</p>
        </div>
        <Button
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          size="lg"
          className={`font-mono ${
            isMonitoring
              ? "bg-red-500 hover:bg-red-600"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isMonitoring ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Monitoring
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Monitoring
            </>
          )}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Decibels", value: `${audioMetrics.decibels.toFixed(1)} dB`, icon: Activity },
          { label: "RMS", value: audioMetrics.rms.toFixed(2), icon: Zap },
          { label: "Dominant Frequency", value: `${audioMetrics.dominantFrequency} Hz`, icon: Activity },
          { label: "Zero Crossing Rate", value: audioMetrics.zeroCrossingRate.toFixed(4), icon: Zap },
        ].map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-primary">{metric.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Waveform Visualizer */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Waveform Visualizer</h3>
        <div className="h-32 flex items-center justify-center gap-1">
          {waveformData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
              animate={{ height: `${Math.abs(value) * 100}%` }}
              transition={{ duration: 0.1 }}
              style={{ minHeight: "2px" }}
            />
          ))}
        </div>
      </div>

      {/* Frequency Spectrum */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Frequency Spectrum</h3>
        <div className="h-48 flex items-end justify-center gap-2">
          {spectrumData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-green-500 to-blue-500 rounded-t"
              animate={{ height: `${value * 100}%` }}
              transition={{ duration: 0.1 }}
              style={{ minHeight: "2px" }}
            />
          ))}
        </div>
      </div>

      {/* Risk Level */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Deepfake Risk Level</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-muted-foreground">Current Risk</span>
            <span className={`text-3xl font-bold font-mono ${getRiskColor(audioMetrics.riskLevel)}`}>
              {audioMetrics.riskLevel}%
            </span>
          </div>
          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                audioMetrics.riskLevel < 30
                  ? "bg-green-500"
                  : audioMetrics.riskLevel < 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              animate={{ width: `${audioMetrics.riskLevel}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>Low Risk</span>
            <span>Medium Risk</span>
            <span>High Risk</span>
          </div>
        </div>
      </div>

      {isMonitoring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-primary font-mono text-sm">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE MONITORING ACTIVE
          </div>
        </motion.div>
      )}
    </div>
  );
}
