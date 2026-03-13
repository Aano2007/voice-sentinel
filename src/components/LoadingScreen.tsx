import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Terminal, Lock, Shield, Zap, CheckCircle2 } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { text: "Initializing neural network...", icon: Terminal, duration: 800 },
    { text: "Loading AI detection models...", icon: Shield, duration: 1000 },
    { text: "Calibrating audio processors...", icon: Zap, duration: 900 },
    { text: "Establishing secure connection...", icon: Lock, duration: 700 },
    { text: "System ready. Access granted.", icon: CheckCircle2, duration: 600 },
  ];

  const hackingLogs = [
    "> Connecting to secure server...",
    "> Authenticating credentials...",
    "> [OK] Connection established",
    "> Loading deepfake detection algorithms...",
    "> Initializing spectral analysis engine...",
    "> [OK] Audio processor online",
    "> Configuring neural network layers...",
    "> [OK] AI model loaded successfully",
    "> Running system diagnostics...",
    "> [OK] All systems operational",
    "> Preparing user interface...",
    "> [OK] Ready for deployment",
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // Hacking logs animation
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < hackingLogs.length) {
        setLogs((prev) => [...prev, hackingLogs[logIndex]]);
        logIndex++;
      }
    }, 350);

    // Steps animation
    let stepIndex = 0;
    let stepTimeout: NodeJS.Timeout;
    
    const nextStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        stepTimeout = setTimeout(() => {
          stepIndex++;
          nextStep();
        }, steps[stepIndex].duration);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    };
    
    nextStep();

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearTimeout(stepTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background cyber-grid flex items-center justify-center"
      >
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(transparent 50%, rgba(59, 130, 246, 0.03) 50%)",
            backgroundSize: "100% 4px",
          }}
          animate={{ backgroundPositionY: ["0px", "4px"] }}
          transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
        />

        {/* Glitch effect overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-primary/5"
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
        />

        <div className="relative z-10 max-w-4xl w-full mx-4">
          {/* Main terminal window */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card/90 backdrop-blur-xl border-2 border-primary/30 rounded-lg overflow-hidden shadow-2xl"
          >
            {/* Terminal header */}
            <div className="bg-primary/10 border-b border-primary/30 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs font-mono text-primary uppercase tracking-wider">
                  Voice Sentinel Terminal v1.0
                </span>
              </div>
            </div>

            {/* Terminal content */}
            <div className="p-6 space-y-6">
              {/* Logo and title */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Terminal className="w-12 h-12 text-primary" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold font-mono text-primary">
                    INITIALIZING SYSTEM
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono">
                    Please wait while we prepare the environment...
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Loading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              {/* Loading steps */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: isActive || isCompleted ? 1 : 0.3,
                        x: 0,
                      }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-500/20 text-green-500"
                            : isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-mono ${
                          isActive || isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.text}
                      </span>
                      {isActive && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-primary"
                        >
                          ▊
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Hacking logs terminal */}
              <div className="bg-black/50 rounded-lg p-4 h-48 overflow-hidden border border-primary/20">
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        log.includes("[OK]")
                          ? "text-green-500"
                          : log.startsWith(">")
                          ? "text-blue-400"
                          : "text-gray-400"
                      }`}
                    >
                      {log}
                      {index === logs.length - 1 && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="ml-1"
                        >
                          _
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Access granted message */}
              <AnimatePresence>
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center gap-2 text-green-500 font-mono text-lg font-bold"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      ACCESS GRANTED
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-4 text-xs text-muted-foreground font-mono"
          >
            Powered by Voice Sentinel AI • Secure Audio Analysis System
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
