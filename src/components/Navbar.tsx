import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Trophy, Users, CreditCard, Shield, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            BeerTracker
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                size="sm"
                onClick={() => window.location.href = item.path}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-1" />
                  Log out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => window.location.href = '/login'}>
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  location.pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-secondary rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md"
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
