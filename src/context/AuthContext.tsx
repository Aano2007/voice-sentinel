import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { onAuthChange, auth, firebaseReady, type User } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, refreshUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Force re-read currentUser after profile mutations (e.g. photo upload)
  const refreshUser = useCallback(() => {
    setUser(auth.currentUser ? { ...auth.currentUser } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
