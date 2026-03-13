import { useState, useRef, useCallback } from "react";
import { Upload, Mic, Square, Send, FileAudio, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface AudioInputProps {
  onAnalyze: (source: "upload" | "recording") => void;
  onRecordingChunk: () => void;
  isAnalyzing: boolean;
}

export function AudioInput({ onAnalyze, onRecordingChunk, isAnalyzing }: AudioInputProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, audioUrl: recordedUrl, duration, startRecording, stopRecording } = useAudioRecorder();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["audio/wav", "audio/mpeg", "audio/ogg", "audio/flac", "audio/webm"];
    if (!validTypes.includes(file.type)) return;
    setUploadedFile(file);
    setUploadedUrl(URL.createObjectURL(file));
  }, []);

  const togglePlay = useCallback(() => {
    const url = uploadedUrl || recordedUrl;
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [uploadedUrl, recordedUrl, isPlaying]);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(onRecordingChunk);
    }
  }, [isRecording, startRecording, stopRecording, onRecordingChunk]);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div
        className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-primary/[0.02] group-hover:bg-primary/[0.05] transition-colors" />
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.mp3,.ogg,.flac,.webm"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
        <p className="text-sm text-muted-foreground font-mono">
          Drop audio file or click to upload
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
          WAV • MP3 • OGG • FLAC
        </p>
      </div>

      {/* Uploaded file info */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
          >
            <FileAudio className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-foreground truncate">{uploadedFile.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={togglePlay} className="text-primary hover:text-primary">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Analyze Button */}
      {uploadedFile && (
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono glow-primary"
          onClick={() => onAnalyze("upload")}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Uploaded Audio"}
        </Button>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">or record live</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Recording Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <motion.button
            onClick={handleRecord}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-colors ${
              isRecording
                ? "bg-destructive/20 border-destructive text-destructive"
                : "bg-primary/10 border-primary/30 text-primary hover:border-primary"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </motion.button>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-destructive pointer-events-none"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-destructive pointer-events-none"
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </div>

        <p className="text-sm font-mono text-muted-foreground">
          {isRecording ? (
            <span className="text-destructive">● REC {formatDuration(duration)}</span>
          ) : (
            "Tap to start recording"
          )}
        </p>

        {/* Recorded audio */}
        {recordedUrl && !isRecording && (
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
              <FileAudio className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                Recording • {formatDuration(duration)}
              </span>
              <Button size="sm" variant="ghost" onClick={togglePlay} className="ml-auto text-primary">
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono glow-accent"
              onClick={() => onAnalyze("recording")}
              disabled={isAnalyzing}
            >
              <Send className="w-4 h-4 mr-2" />
              Analyze Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
