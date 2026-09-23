import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Shield, Clock, Users, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import type { SyncState } from "../types";

export function AdminPage() {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [stats, setStats] = useState({ users: 0, unlinked: 0, avgPerUser: 0 });
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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
        <StatCard
          icon={CreditCard}
          label="Unlinked Cards"
          value={stats.unlinked.toLocaleString()}
        />
        <StatCard
          icon={Shield}
          label="Avg Spent per User"
          value={`${stats.avgPerUser.toFixed(0)} kr`}
        />
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : syncState ? (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Last Purchase Hash
                  </TableCell>
                  <TableCell className="font-mono text-right">
                    {syncState.lastPurchaseHash?.slice(0, 40)}...
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Last Sync
                  </TableCell>
                  <TableCell className="text-right">
                    {syncState.lastSyncAt
                      ? formatDate(syncState.lastSyncAt)
                      : "Never"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Total Purchases Synced
                  </TableCell>
                  <TableCell className="text-right">
                    {syncState.totalPurchasesSynced?.toLocaleString() || "0"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No sync state found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function formatDate(ts: any) {
  if (!ts) return "Never";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString("no-NO");
}
