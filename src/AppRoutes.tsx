import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { Leaderboard } from "./pages/Leaderboard";
import { UsersPage } from "./pages/UsersPage";
import { CardsPage } from "./pages/CardsPage";
import { CardDetailPage } from "./pages/CardDetailPage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { Skeleton } from "@/components/ui/skeleton";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Leaderboard />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/cards" element={<CardsPage />} />
      <Route path="/cards/:cardId" element={<CardDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
