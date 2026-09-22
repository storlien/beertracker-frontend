import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Trophy, Users, CreditCard, Shield, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "sonner";

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Leaderboard", icon: Trophy },
    { path: "/users", label: "Users", icon: Users },
    { path: "/cards", label: "Cards", icon: CreditCard },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", label: "Admin", icon: Shield });
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            BeerTracker
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-surface-hover text-text"
                    : "text-text-muted hover:text-text hover:bg-surface-hover"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-danger hover:bg-surface-hover rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  location.pathname === item.path
                    ? "bg-surface-hover text-text"
                    : "text-text-muted hover:text-text hover:bg-surface-hover"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-surface-hover rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-md"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
