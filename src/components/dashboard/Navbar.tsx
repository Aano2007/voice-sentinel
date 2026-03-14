import { useRef, useState, useEffect } from "react";
import {
  Radio, Wifi, History, LogOut, User, Shield,
  BarChart3, Settings, ChevronDown, Camera, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logout, uploadProfilePhoto } from "@/lib/firebase";

export function Navbar() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPhotoURL(user?.photoURL ?? ""); }, [user?.photoURL]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate("/sign-in"); };
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoURL(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(file);
      setPhotoURL(url);
      refreshUser();
    } catch {
      setPhotoURL(user?.photoURL ?? "");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "U";

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email ?? "";

  const menuItems = [
    { icon: User,      label: "My Profile",       desc: "View account details",      action: () => { navigate("/profile");     setOpen(false); } },
    { icon: Shield,    label: "Security Settings", desc: "Manage auth & privacy",     action: () => { navigate("/security");    setOpen(false); } },
    { icon: BarChart3, label: "My Detections",     desc: "View all past analyses",    action: () => { navigate("/history");     setOpen(false); } },
    { icon: Settings,  label: "Preferences",       desc: "Customize your experience", action: () => { navigate("/preferences"); setOpen(false); } },
  ];

  const Avatar = ({ size }: { size: "sm" | "lg" }) => {
    const dim = size === "sm" ? "w-7 h-7" : "w-14 h-14";
    const text = size === "sm" ? "text-xs" : "text-lg";
    return (
      <div className={`${dim} rounded-full bg-[#818cf8]/10 border border-[#818cf8]/30 flex items-center justify-center shrink-0 overflow-hidden`}>
        {photoURL
          ? <img src={photoURL} alt={displayName} className={`${dim} rounded-full object-cover`} />
          : <span className={`font-mono ${text} font-bold text-[#818cf8]`}>{initials}</span>}
      </div>
    );
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <Radio className="w-8 h-8 text-primary" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight text-foreground">Audio Deepfake Detector</h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">AI Voice Authentication System</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="flex items-center gap-2 text-primary hover:text-primary hover:bg-primary/10 font-mono">
          <History className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">History</span>
        </Button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-xs font-mono text-primary">SYSTEM ACTIVE</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
          <Wifi className="w-4 h-4" />
          <span className="text-xs font-mono">CONNECTED</span>
        </div>

        {/* User dropdown trigger */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-[#232a3d] bg-white/5 hover:bg-white/8 hover:border-[#818cf8]/30 transition-all"
          >
            <Avatar size="sm" />
            <span className="hidden md:block font-mono text-xs text-[#e8eaf0] max-w-[100px] truncate">{displayName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#7a8499] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 rounded-xl border border-[#232a3d] bg-[rgba(13,16,24,0.97)] backdrop-blur-xl shadow-2xl overflow-hidden"
                style={{ boxShadow: "0 0 30px rgba(129,140,248,0.1)" }}
              >
                {/* Profile header */}
                <div className="px-4 pt-5 pb-4 border-b border-[#232a3d] flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                    <div className="w-14 h-14 rounded-full bg-[#818cf8]/10 border-2 border-[#818cf8]/30 flex items-center justify-center overflow-hidden">
                      {photoURL
                        ? <img src={photoURL} alt={displayName} className="w-14 h-14 rounded-full object-cover" />
                        : <span className="font-mono text-lg font-bold text-[#818cf8]">{initials}</span>}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                    </div>
                    {uploading && (
                      <motion.div className="absolute inset-0 rounded-full border-2 border-[#818cf8]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    )}
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />

                  <div className="text-center">
                    <p className="font-mono text-sm font-bold text-[#e8eaf0]">{displayName}</p>
                    <p className="font-mono text-[11px] text-[#7a8499] mt-0.5">{email}</p>
                    <p className="font-mono text-[10px] text-[#818cf8]/70 mt-1 uppercase tracking-widest">
                      {uploading ? "Uploading photo..." : "Click photo to change"}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {menuItems.map((item) => (
                    <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] flex items-center justify-center shrink-0 group-hover:bg-[#818cf8]/10 group-hover:border group-hover:border-[#818cf8]/20 transition-all">
                        <item.icon className="w-3.5 h-3.5 text-[#7a8499] group-hover:text-[#818cf8] transition-colors" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-mono text-xs text-[#e8eaf0]">{item.label}</p>
                        <p className="font-mono text-[10px] text-[#7a8499]">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-[#232a3d] mx-3" />

                {/* Logout */}
                <div className="py-1.5">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors group hover:bg-red-500/10">
                    <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] flex items-center justify-center shrink-0 group-hover:bg-red-500/10 group-hover:border group-hover:border-red-500/30 transition-all">
                      <LogOut className="w-3.5 h-3.5 text-[#7a8499] group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="font-mono text-xs text-[#e8eaf0] group-hover:text-red-400 transition-colors">Sign Out</p>
                      <p className="font-mono text-[10px] text-[#7a8499]">End your session</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
