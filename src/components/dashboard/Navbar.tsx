import { Shield, Wifi } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight text-foreground">
            Audio Deepfake Detector
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            AI Voice Authentication System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-primary">SYSTEM ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Wifi className="w-4 h-4" />
          <span className="text-xs font-mono">CONNECTED</span>
        </div>
      </div>
    </nav>
  );
}
