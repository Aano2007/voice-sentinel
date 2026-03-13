export interface AudioRecord {
  id: string;
  type: "upload" | "recording";
  fileName: string;
  fileSize: number;
  duration: number;
  timestamp: number;
  result: {
    label: "Real Voice" | "Deepfake Detected" | "Suspicious";
    confidence: number;
    riskScore: number;
  };
  features: {
    spectralCentroid: number;
    zeroCrossingRate: number;
    pitchVariation: number;
    harmonicRatio: number;
  };
  indicators: Array<{
    name: string;
    detected: boolean;
    severity: "low" | "medium" | "high";
  }>;
}

const DB_KEY = "voice_sentinel_history";

export const AudioDatabase = {
  // Get all records
  getAll(): AudioRecord[] {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get records by type
  getByType(type: "upload" | "recording"): AudioRecord[] {
    return this.getAll().filter((record) => record.type === type);
  },

  // Get single record by ID
  getById(id: string): AudioRecord | null {
    const records = this.getAll();
    return records.find((record) => record.id === id) || null;
  },

  // Add new record
  add(record: Omit<AudioRecord, "id" | "timestamp">): AudioRecord {
    const records = this.getAll();
    const newRecord: AudioRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    records.unshift(newRecord); // Add to beginning
    localStorage.setItem(DB_KEY, JSON.stringify(records));
    return newRecord;
  },

  // Delete record
  delete(id: string): void {
    const records = this.getAll().filter((record) => record.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(records));
  },

  // Clear all records
  clear(): void {
    localStorage.removeItem(DB_KEY);
  },

  // Get statistics
  getStats() {
    const records = this.getAll();
    const uploads = records.filter((r) => r.type === "upload");
    const recordings = records.filter((r) => r.type === "recording");
    const deepfakes = records.filter((r) => r.result.label === "Deepfake Detected");
    const realVoices = records.filter((r) => r.result.label === "Real Voice");
    const suspicious = records.filter((r) => r.result.label === "Suspicious");

    return {
      total: records.length,
      uploads: uploads.length,
      recordings: recordings.length,
      deepfakes: deepfakes.length,
      realVoices: realVoices.length,
      suspicious: suspicious.length,
      avgRiskScore:
        records.length > 0
          ? records.reduce((sum, r) => sum + r.result.riskScore, 0) / records.length
          : 0,
    };
  },
};
