import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Shield, Clock, Database, RefreshCw } from "lucide-react";
import type { SyncState } from "../types";

export function AdminPage() {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [stats, setStats] = useState({ cards: 0, users: 0, totalSpent: 0 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "info", "state"), (d) => {
      if (d.exists()) setSyncState(d.data() as SyncState);
    });

    async function fetchStats() {
      const cardsSnap = await getDocs(collection(db, "cards"));
      const usersSnap = await getDocs(collection(db, "users"));
      const total = cardsSnap.docs.reduce((s, d) => s + (d.data().sum || 0), 0);
      setStats({
        cards: cardsSnap.size,
        users: usersSnap.size,
        totalSpent: total,
      });
    }
    fetchStats();

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        Admin Panel
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Database} label="Total Cards" value={stats.cards.toString()} />
        <StatCard icon={Shield} label="Total Users" value={stats.users.toString()} />
        <StatCard icon={RefreshCw} label="Total Spent" value={`${stats.totalSpent.toFixed(0)} kr`} />
      </div>

      {/* Sync Status */}
      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Sync Status
        </h2>

        {syncState ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Last Purchase Hash</span>
              <span className="font-mono">{syncState.lastPurchaseHash?.slice(0, 40)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Last Sync</span>
              <span>{syncState.lastSyncAt ? formatDate(syncState.lastSyncAt) : "Never"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Purchases Synced</span>
              <span>{syncState.totalPurchasesSynced?.toLocaleString() || "0"}</span>
            </div>
          </div>
        ) : (
          <p className="text-text-muted">No sync state found</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-text-muted mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function formatDate(ts: any) {
  if (!ts) return "Never";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString("no-NO");
}
