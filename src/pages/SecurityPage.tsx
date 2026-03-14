import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Shield, Smartphone, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth, logout } from "@/lib/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: d } }) };

export default function SecurityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState("");
  const [error, setError]             = useState("");

  const isEmailProvider = user?.providerData[0]?.providerId === "password";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPass !== confirmPass) { setError("New passwords do not match."); return; }
    if (newPass.length < 8)      { setError("Password must be at least 8 characters."); return; }
    if (!auth.currentUser || !user?.email) return;
    setSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPass);
      setSuccess("Password updated successfully.");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err: any) {
      const map: Record<string, string> = {
        "auth/wrong-password":       "Current password is incorrect.",
        "auth/too-many-requests":    "Too many attempts. Please wait.",
        "auth/weak-password":        "New password is too weak.",
        "auth/requires-recent-login":"Please sign out and sign in again before changing your password.",
      };
      setError(map[err.code] ?? "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAll = async () => {
    await logout();
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#fafafa]">
      <div className="border-b border-[#1e1e1e] px-6 py-4 flex items-center gap-4 bg-[rgba(14,14,14,0.8)] backdrop-blur-xl sticky top-0 z-40">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-[#a3a3a3] hover:text-[#fafafa] transition-colors font-mono text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>

          <motion.div variants={fadeUp} custom={0}>
            <p className="section-label mb-2">Account</p>
            <h1 className="font-display text-2xl font-bold text-[#fafafa]">Security Settings</h1>
            <p className="text-[#a3a3a3] text-sm mt-1">Manage your password and account security.</p>
          </motion.div>

          {/* Security overview */}
          <motion.div variants={fadeUp} custom={0.1} className="vg-card rounded-xl p-6 mt-6">
            <h2 className="font-display text-sm font-bold text-[#fafafa] mb-4">Security Overview</h2>
            <div className="space-y-3">
              {[
                { icon: Shield,      label: "Sign-in Method",    value: isEmailProvider ? "Email & Password" : "OAuth (Google)", ok: true },
                { icon: Smartphone,  label: "Active Sessions",   value: "1 device (current)", ok: true },
                { icon: Lock,        label: "Password Strength", value: isEmailProvider ? "Protected" : "Managed by provider", ok: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4 py-3 border-b border-[#1e1e1e] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <row.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-wider">{row.label}</p>
                    <p className="font-mono text-sm text-[#fafafa]">{row.value}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Change password — only for email/password users */}
          {isEmailProvider ? (
            <motion.div variants={fadeUp} custom={0.2} className="vg-card rounded-xl p-6">
              <h2 className="font-display text-sm font-bold text-[#fafafa] mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <input type={showCurrent ? "text" : "password"} placeholder="Current password" value={currentPass}
                    onChange={(e) => { setCurrentPass(e.target.value); setError(""); setSuccess(""); }} required
                    className="w-full bg-[#0a0a0a] border border-[#1e1e1e] focus:border-blue-500/60 rounded-lg pl-10 pr-10 py-3 text-sm text-[#fafafa] placeholder-[#a3a3a3] outline-none transition-colors font-mono" />
                  <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#fafafa]">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* New */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <input type={showNew ? "text" : "password"} placeholder="New password" value={newPass}
                    onChange={(e) => { setNewPass(e.target.value); setError(""); setSuccess(""); }} required
                    className="w-full bg-[#0a0a0a] border border-[#1e1e1e] focus:border-blue-500/60 rounded-lg pl-10 pr-10 py-3 text-sm text-[#fafafa] placeholder-[#a3a3a3] outline-none transition-colors font-mono" />
                  <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#fafafa]">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Confirm */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <input type="password" placeholder="Confirm new password" value={confirmPass}
                    onChange={(e) => { setConfirmPass(e.target.value); setError(""); setSuccess(""); }} required
                    className="w-full bg-[#0a0a0a] border border-[#1e1e1e] focus:border-blue-500/60 rounded-lg pl-10 pr-4 py-3 text-sm text-[#fafafa] placeholder-[#a3a3a3] outline-none transition-colors font-mono" />
                </div>

                {success && <div className="flex items-center gap-2 text-green-400 text-xs font-mono"><CheckCircle2 className="w-3.5 h-3.5" />{success}</div>}
                {error   && <div className="flex items-center gap-2 text-red-400 text-xs font-mono"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}

                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} custom={0.2} className="vg-card rounded-xl p-6">
              <h2 className="font-display text-sm font-bold text-[#fafafa] mb-2">Password</h2>
              <p className="text-[#a3a3a3] text-sm font-mono">Your account uses Google sign-in. Password management is handled by Google.</p>
            </motion.div>
          )}

          {/* Danger zone */}
          <motion.div variants={fadeUp} custom={0.3} className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="font-display text-sm font-bold text-red-400 mb-1">Danger Zone</h2>
            <p className="text-[#a3a3a3] text-xs font-mono mb-4">Sign out from all active sessions immediately.</p>
            <button onClick={handleSignOutAll} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs uppercase tracking-widest transition-all">
              <LogOut className="w-4 h-4" /> Sign Out All Sessions
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
