import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Shield, Clock, Users, CreditCard } from "lucide-react";
import type { SyncState } from "../types";

export function AdminPage() {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [stats, setStats] = useState({ users: 0, unlinked: 0, avgPerUser: 0 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "info", "state"), (d) => {
      if (d.exists()) setSyncState(d.data() as SyncState);
    });

    async function fetchStats() {
      const cardsSnap = await getDocs(collection(db, "cards"));
      const usersSnap = await getDocs(collection(db, "users"));

      let totalLinked = 0;
      let unlinked = 0;
      cardsSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.linkedUserId && data.linkedUserId !== "") {
          totalLinked += data.sum || 0;
        } else {
          unlinked++;
        }
      });

      const userCount = usersSnap.size;
      setStats({
        users: userCount,
        unlinked,
        avgPerUser: userCount > 0 ? totalLinked / userCount : 0,
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
        <StatCard icon={Users} label="Users" value={stats.users.toString()} />
        <StatCard icon={CreditCard} label="Unlinked Cards" value={stats.unlinked.toLocaleString()} />
        <StatCard icon={Shield} label="Avg Spent per User" value={`${stats.avgPerUser.toFixed(0)} kr`} />
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
