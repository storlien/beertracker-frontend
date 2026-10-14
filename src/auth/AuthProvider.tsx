import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { User } from "../types";

interface AuthContextType {
  user: { uid: string; email: string | null; displayName: string | null } | null;
  isAdmin: boolean;
  loading: boolean;
  profile: User | null;
  profileReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  profile: null,
  profileReady: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
        });
        // Check admin claim from custom token
        const token = await fbUser.getIdTokenResult(true);
        setIsAdmin(token.claims.role === "admin");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileReady(true);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (d) => {
        setProfile(d.exists() ? ({ id: d.id, ...d.data() } as User) : null);
        setProfileReady(true);
      },
      (err) => {
        console.error("Profile listener error:", err);
        setProfileReady(true);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, profile, profileReady }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export type { AuthContextType };
