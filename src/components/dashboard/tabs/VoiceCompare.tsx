import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Users, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VoiceCompare() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<{
    similarity: number;
    verdict: "Same Speaker" | "Different Speaker";
  } | null>(null);

  const handleCompare = () => {
    if (!file1 || !file2) return;
    
    // Simulate MFCC comparison
    const similarity = Math.random() * 100;
    const verdict = similarity > 70 ? "Same Speaker" : "Different Speaker";
    
    setResult({ similarity, verdict });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary mb-1">Voice Comparison</h1>
        <p className="text-sm text-muted-foreground font-mono">Compare two audio files using MFCC features</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((num) => (
          <div key={num} className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Audio File {num}</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) num === 1 ? setFile1(file) : setFile2(file);
                }}
                className="hidden"
                id={`file${num}`}
              />
              <label htmlFor={`file${num}`} className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-mono text-muted-foreground">
                  {(num === 1 ? file1 : file2)?.name || "Click to upload"}
                </p>
              </label>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleCompare}
        disabled={!file1 || !file2}
        className="w-full bg-primary hover:bg-primary/90 font-mono"
        size="lg"
      >
        <Users className="w-4 h-4 mr-2" />
        Compare Voices
      </Button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-sm font-mono text-muted-foreground uppercase mb-4">Comparison Result</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">Similarity Percentage</span>
              <span className="text-3xl font-bold font-mono text-primary">{result.similarity.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${result.similarity}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-primary/30 bg-primary/10">
              {result.verdict === "Same Speaker" ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <span className="text-xl font-bold font-mono text-primary">{result.verdict}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
