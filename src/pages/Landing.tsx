import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radio, Shield, Zap, Lock, Waves, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function Landing() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate("/dashboard");
  };

  const features = [
    {
      icon: Radio,
      title: "Real-time Analysis",
      description: "Instant AI voice detection with advanced algorithms",
      color: "text-blue-500",
      delay: 0.2,
    },
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Protect against sophisticated deepfake attacks",
      color: "text-purple-500",
      delay: 0.4,
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process audio files in milliseconds",
      color: "text-yellow-500",
      delay: 0.6,
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your audio data never leaves your device",
      color: "text-green-500",
      delay: 0.8,
    },
  ];

  return (
    <>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-50"
            />
            <div className="relative bg-card border-2 border-primary/30 rounded-full p-6">
              <Radio className="w-16 h-16 text-primary" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold font-mono mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            VOICE SENTINEL
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <p className="text-xl md:text-2xl text-muted-foreground font-mono uppercase tracking-widest">
              AI Audio Deepfake Detector
            </p>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Protect yourself from AI-generated voice fraud with cutting-edge deepfake detection technology
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-mono text-lg px-8 py-6 rounded-xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              Get Started
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-lg font-bold font-mono mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-3xl w-full"
        >
          {[
            { value: "97.3%", label: "Accuracy" },
            { value: "<100ms", label: "Detection Speed" },
            { value: "6+", label: "AI Indicators" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1, type: "spring" }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Waveform visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex items-center gap-1"
        >
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
              animate={{
                height: [
                  Math.random() * 40 + 10,
                  Math.random() * 60 + 20,
                  Math.random() * 40 + 10,
                ],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
}
