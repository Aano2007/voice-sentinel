import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  data: number[][] | null;
}

export function SpectrogramView({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    canvas.width = cols * 3;
    canvas.height = rows * 3;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = data[i][j];
        // Map value to color: dark blue -> cyan -> green -> yellow
        const r = Math.floor(val * val * 255);
        const g = Math.floor(val * 200 + 20);
        const b = Math.floor((1 - val) * 180 + 40);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(j * 3, (rows - 1 - i) * 3, 3, 3);
      }
    }
  }, [data]);

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-xs text-muted-foreground font-mono">No spectrogram data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
        Audio Frequency Analysis (Spectrogram)
      </h4>
      <div className="rounded overflow-hidden border border-border">
        <canvas ref={canvasRef} className="w-full h-auto" style={{ imageRendering: "pixelated" }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] font-mono text-muted-foreground">0 Hz</span>
        <span className="text-[9px] font-mono text-muted-foreground">Time →</span>
        <span className="text-[9px] font-mono text-muted-foreground">8000 Hz</span>
      </div>
    </motion.div>
  );
}
