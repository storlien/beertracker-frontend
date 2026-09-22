import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { LogIn, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-surface rounded-lg border border-border p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-md transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Logging in..." : "Login with Email"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface text-text-muted">or</span>
          </div>
        </div>

        {/* Abakus OAuth Placeholder */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-2 bg-surface-hover border border-border cursor-not-allowed text-text-muted rounded-md"
        >
          <ExternalLink className="w-4 h-4" />
          Login with Abakus (coming soon)
        </button>

        <p className="text-sm text-text-muted text-center">
          Only admin access is available for testing.
        </p>
      </div>
    </div>
  );
}
