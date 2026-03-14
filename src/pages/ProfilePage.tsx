import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, CheckCircle2, AlertCircle, User, Mail, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadProfilePhoto, auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: d } }) };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [joinedDate, setJoinedDate] = useState("");

  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "U";

  const provider = user?.providerData[0]?.providerId ?? "password";
  const providerLabel = provider === "google.com" ? "Google" : provider === "github.com" ? "GitHub" : "Email / Password";

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.createdAt?.toDate) {
          setJoinedDate(data.createdAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
        }
      }
    });
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoURL(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const url = await uploadProfilePhoto(file);
      setPhotoURL(url);
      refreshUser();
      setSuccess("Profile photo updated.");
    } catch {
      setError("Failed to upload photo.");
      setPhotoURL(user?.photoURL ?? "");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim() || !auth.currentUser) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await setDoc(doc(db, "users", auth.currentUser.uid), { displayName: displayName.trim() }, { merge: true });
      refreshUser();
      setSuccess("Display name updated.");
    } catch {
      setError("Failed to update name.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#fafafa]">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] px-6 py-4 flex items-center gap-4 bg-[rgba(14,14,14,0.8)] backdrop-blur-xl sticky top-0 z-40">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-[#a3a3a3] hover:text-[#fafafa] transition-colors font-mono text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>

          {/* Title */}
          <motion.div variants={fadeUp} custom={0}>
            <p className="section-label mb-2">Account</p>
            <h1 className="font-display text-2xl font-bold text-[#fafafa]">My Profile</h1>
            <p className="text-[#a3a3a3] text-sm mt-1">Manage your personal information and profile photo.</p>
          </motion.div>

          {/* Avatar card */}
          <motion.div variants={fadeUp} custom={0.1} className="vg-card rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 mt-6">
            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full bg-[#bcb8b1]/10 border-2 border-[#bcb8b1]/30 flex items-center justify-center overflow-hidden">
                {photoURL
                  ? <img src={photoURL} alt={displayName} className="w-20 h-20 rounded-full object-cover" />
                  : <span className="font-mono text-2xl font-bold text-[#bcb8b1]">{initials}</span>}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </div>
              {uploading && (
                <motion.div className="absolute inset-0 rounded-full border-2 border-blue-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoChange} />
            <div>
              <p className="font-mono text-sm font-bold text-[#fafafa]">{user?.displayName || user?.email?.split("@")[0]}</p>
              <p className="font-mono text-xs text-[#a3a3a3] mt-0.5">{user?.email}</p>
              <p className="font-mono text-[10px] text-[#bcb8b1] mt-2 uppercase tracking-widest">Click photo to change</p>
            </div>
          </motion.div>

          {/* Edit name */}
          <motion.div variants={fadeUp} custom={0.2} className="vg-card rounded-xl p-6 space-y-4">
            <h2 className="font-display text-sm font-bold text-[#fafafa]">Display Name</h2>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setSuccess(""); setError(""); }}
                className="w-full bg-[#0a0a0a] border border-[#1e1e1e] focus:border-[#bcb8b1]/50 rounded-lg pl-10 pr-4 py-3 text-sm text-[#fafafa] outline-none transition-colors font-mono"
                placeholder="Your display name"
              />
            </div>
            {success && <div className="flex items-center gap-2 text-green-400 text-xs font-mono"><CheckCircle2 className="w-3.5 h-3.5" />{success}</div>}
            {error  && <div className="flex items-center gap-2 text-red-400 text-xs font-mono"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}
            <button onClick={handleSaveName} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
            </button>
          </motion.div>

          {/* Account info */}
          <motion.div variants={fadeUp} custom={0.3} className="vg-card rounded-xl p-6 space-y-4">
            <h2 className="font-display text-sm font-bold text-[#fafafa]">Account Information</h2>
            {[
              { icon: Mail,     label: "Email Address", value: user?.email ?? "—" },
              { icon: Shield,   label: "Sign-in Method", value: providerLabel },
              { icon: Calendar, label: "Member Since",   value: joinedDate || "—" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-4 py-3 border-b border-[#1e1e1e] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-[#bcb8b1]/08 border border-[#bcb8b1]/15 flex items-center justify-center shrink-0">
                  <row.icon className="w-4 h-4 text-[#bcb8b1]" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-wider">{row.label}</p>
                  <p className="font-mono text-sm text-[#fafafa]">{row.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
