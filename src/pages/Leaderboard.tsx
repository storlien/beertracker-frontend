import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Trophy, Clock, AlertTriangle, Info, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SyncState } from "../types";

interface LeaderboardEntry {
  id: string;
  name: string;
  isUser: boolean;
  sum: number;
  cards: string[];
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubBoard = onSnapshot(
      doc(db, "leaderboard", "top100"),
      (d) => {
        if (d.exists()) {
          const data = d.data();
          const rawEntries = data.entries || [];
          // Ensure numbers are actually numbers (Firestore sometimes returns them differently)
          const parsed: LeaderboardEntry[] = rawEntries.map((e: any) => ({
            id: String(e.id || ""),
            name: String(e.name || "Unknown"),
            isUser: Boolean(e.isUser),
            sum: typeof e.sum === "number" ? e.sum : parseFloat(e.sum) || 0,
            cards: Array.isArray(e.cards) ? e.cards.map(String) : [],
          }));
          setEntries(parsed);
        } else {
          setEntries([]);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore leaderboard error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubState = onSnapshot(
      doc(db, "info", "state"),
      (d) => {
        if (d.exists()) {
          setSyncState(d.data() as SyncState);
        }
      },
      (err) => console.error("Firestore state error:", err)
    );

    return () => {
      unsubBoard();
      unsubState();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Trophy} label="Total Spent" value="—" />
        <StatCard icon={Users} label="Total Cards" value="—" />
        <StatCard
          icon={Clock}
          label="Last Sync"
          value={
            syncState?.lastSyncAt ? formatTime(syncState.lastSyncAt) : "Never"
          }
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Data Coverage</AlertTitle>
        <AlertDescription>
          Data includes all historical purchases from 16 October 2020. New
          transactions are synced automatically from Zettle.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {error}
            <p className="mt-2">
              This usually means Firestore security rules need to be updated. Go
              to Firebase Console → Firestore Database → Rules and allow reads
              on the <code>leaderboard</code> collection.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Leaderboard
            </CardTitle>
            <span className="text-sm text-muted-foreground">Top 100</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leaderboard data yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge
                            variant={
                              rank === 1
                                ? "default"
                                : rank === 2
                                  ? "secondary"
                                  : rank === 3
                                    ? "outline"
                                    : "secondary"
                            }
                            className={
                              rank === 1
                                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                                : rank === 2
                                  ? "bg-slate-400/20 text-slate-300 hover:bg-slate-400/20"
                                  : rank === 3
                                    ? "bg-amber-600/20 text-amber-500 hover:bg-amber-600/20"
                                    : "bg-transparent"
                            }
                          >
                            {rank}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              entry.isUser
                                ? ""
                                : "text-muted-foreground italic"
                            }`}
                          >
                            {entry.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.cards.map((c) => (
                              <Link
                                key={c}
                                to={`/cards/${c}`}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary border rounded hover:border-primary transition-colors font-mono"
                              >
                                {maskCard(c)}
                              </Link>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">
                            {entry.sum.toFixed(0)} kr
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
  icon: typeof Trophy;
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
        <div className="text-lg font-bold truncate">{value}</div>
      </CardContent>
    </Card>
  );
}

function maskCard(cardNumber: string) {
  if (cardNumber.length !== 10) return cardNumber;
  return cardNumber.slice(0, 6) + "****";
}

function formatTime(ts: any) {
  if (!ts) return "Never";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("no-NO");
}
