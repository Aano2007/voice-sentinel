import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { signInWithEmail, signInWithGoogle, signInWithGithub, resetPassword } from "@/lib/firebase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d } }),
};

function Grain() {
  return (
    <svg className="pointer-events-none fixed inset-0 w-full h-full z-50" style={{ opacity: 0.015 }} aria-hidden>
      <filter id="grain2">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain2)" />
    </svg>
  );
}

function SocialButton({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-[#232a3d] bg-white/5 hover:bg-white/8 hover:border-[#818cf8]/40 text-[#e8eaf0] font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const accountExists = searchParams.get("exists") === "true";

  const clearError = () => setError("");

  const friendlyError = (err: any) => {
    const code: string = err?.code ?? "";
    console.error("[Firebase Auth Error]", code, err?.message);
    const map: Record<string, string> = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Try again.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method.",
      "auth/configuration-not-found": "Firebase is not configured. Add your credentials to the .env file.",
      "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Invalid Firebase API key. Check your .env file.",
      "auth/invalid-api-key": "Invalid Firebase API key. Check your .env file.",
      "auth/network-request-failed": "Network error. Check your internet connection.",
      "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Console.",
      "auth/internal-error": "Firebase internal error. Check your project configuration.",
    };
    return map[code] ?? `Error: ${code || err?.message || "Something went wrong. Please try again."}`;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await signInWithEmail(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: "google" | "github") => {
    setLoading(true);
    clearError();
    try {
      await (provider === "google" ? signInWithGoogle() : signInWithGithub());
      navigate("/dashboard");
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Enter your email address first."); return; }
    setLoading(true);
    clearError();
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#0b0d14] border border-[#232a3d] focus:border-[#818cf8]/60 rounded-lg pl-10 pr-4 py-3 text-sm text-[#e8eaf0] placeholder-[#3d4a63] outline-none transition-colors font-mono";
  const inputIconCls = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4a63]";

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e8eaf0] flex items-center justify-center px-4 cyber-grid relative overflow-hidden">
      <Grain />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,102,241,0.09) 0%, transparent 70%)" }} />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Logo */}
        <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center gap-2 mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <Radio className="w-5 h-5 text-[#818cf8] group-hover:text-[#a5b4fc] transition-colors" />
            <span className="font-display text-sm font-bold tracking-wider text-[#e8eaf0]">VoiceGuard AI</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp}
          custom={0.1}
          className="rounded-2xl border border-[#232a3d] bg-[rgba(19,23,32,0.85)] backdrop-blur-xl p-8"
          style={{ boxShadow: "0 0 40px rgba(129,140,248,0.08)" }}
        >
          {resetMode ? (
            <>
              <h1 className="font-display text-2xl font-bold text-[#e8eaf0] mb-1">Reset Password</h1>
              <p className="text-[#7a8499] text-sm mb-6">Enter your email and we'll send a reset link.</p>

              {resetSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#818cf8]" />
                  </div>
                  <p className="text-[#e8eaf0] font-mono text-sm">Reset link sent!</p>
                  <p className="text-[#7a8499] text-xs">Check your inbox at <span className="text-[#818cf8]">{email}</span></p>
                  <button onClick={() => { setResetMode(false); setResetSent(false); }} className="btn-ghost mt-2 text-xs py-2 px-4">
                    Back to Sign In
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="relative">
                    <Mail className={inputIconCls} />
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} className={inputCls} />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}Send Reset Link
                  </button>
                  <button type="button" onClick={() => { setResetMode(false); clearError(); }} className="w-full text-center text-xs text-[#7a8499] hover:text-[#e8eaf0] font-mono transition-colors">
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-[#e8eaf0] mb-1">Welcome back</h1>
              <p className="text-[#7a8499] text-sm mb-6">Sign in to your VoiceGuard AI account.</p>

              {accountExists && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-[#a5b4fc] text-xs font-mono bg-[#818cf8]/08 border border-[#818cf8]/20 rounded-lg px-3 py-3 mb-6"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>An account with <span className="text-[#818cf8]">{email}</span> already exists. Sign in below.</span>
                </motion.div>
              )}

              <div className="mb-6">
                <SocialButton onClick={() => handleSocial("google")} disabled={loading}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </SocialButton>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#232a3d]" />
                <span className="font-mono text-xs text-[#3d4a63] uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-[#232a3d]" />
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="relative">
                  <Mail className={inputIconCls} />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} required className={inputCls} />
                </div>

                <div className="relative">
                  <Lock className={inputIconCls} />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    required
                    className="w-full bg-[#0b0d14] border border-[#232a3d] focus:border-[#818cf8]/60 rounded-lg pl-10 pr-10 py-3 text-sm text-[#e8eaf0] placeholder-[#3d4a63] outline-none transition-colors font-mono"
                  />
                  <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a63] hover:text-[#e8eaf0] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => { setResetMode(true); clearError(); }} className="font-mono text-xs text-[#818cf8] hover:text-[#a5b4fc] transition-colors">
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}Sign In
                </button>
              </form>

              <p className="text-center text-xs text-[#7a8499] font-mono mt-6">
                Don't have an account?{" "}
                <Link to="/create-account" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">Create one →</Link>
              </p>
            </>
          )}
        </motion.div>

        <motion.p variants={fadeUp} custom={0.3} className="text-center text-xs text-[#7a8499] font-mono mt-6">
          All audio processed locally — zero data exposure
        </motion.p>
      </motion.div>
    </div>
  );
}
