import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, onSnapshot, query, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase";
import { Trophy, Clock, Users, TrendingUp, AlertTriangle, Info } from "lucide-react";
import type { Card, User, SyncState } from "../types";

export function Leaderboard() {
  const [topCards, setTopCards] = useState<Card[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Top 50 cards for leaderboard table
    const q = query(collection(db, "cards"), orderBy("sum", "desc"), limit(50));
    const unsubTopCards = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          cardNumber: d.id,
          ...d.data(),
        })) as Card[];
        setTopCards(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore cards error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Count all cards (once, not real-time — Firestore count is cheap)
    getCountFromServer(collection(db, "cards"))
      .then((snap) => setTotalCards(snap.data().count))
      .catch((err) => console.error("Failed to count cards:", err));

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const map: Record<string, User> = {};
        snapshot.docs.forEach((d) => {
          map[d.id] = { id: d.id, ...d.data() } as User;
        });
        setUsers(map);
      },
      (err) => console.error("Firestore users error:", err)
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
      unsubTopCards();
      unsubUsers();
      unsubState();
    };
  }, []);

  const getCardOwner = (card: Card) => {
    if (!card.linkedUserId || !users[card.linkedUserId]) return null;
    const u = users[card.linkedUserId];
    return `${u.firstName} ${u.lastName}`;
  };

  const totalSpent = topCards.reduce((sum, c) => sum + c.sum, 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Total Spent" value={`${totalSpent.toFixed(0)} kr`} />
        <StatCard icon={Users} label="No. cards used" value={totalCards.toLocaleString()} />
        <StatCard icon={TrendingUp} label="Top Spender" value={topCards[0] ? getCardOwner(topCards[0]) || topCards[0].cardNumber : "-"} />
        <StatCard icon={Clock} label="Last Sync" value={syncState?.lastSyncAt ? formatTime(syncState.lastSyncAt) : "Never"} />
      </div>

      {/* Historical data note */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-text">
            Data includes all historical purchases from the earliest registered transaction.
            New transactions are synced automatically from Zettle.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger">Database Error</p>
            <p className="text-sm text-text-muted">{error}</p>
            <p className="text-sm text-text-muted mt-2">
              This usually means Firestore security rules need to be updated.
              Go to Firebase Console → Firestore Database → Rules and allow reads.
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </h2>
          <span className="text-sm text-text-muted">Top 50 by amount spent</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : topCards.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No cards yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-muted">
                  <th className="px-4 py-2 w-12">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Card</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topCards.map((card, index) => {
                  const owner = getCardOwner(card);
                  const rank = index + 1;
                  return (
                    <tr key={card.cardNumber} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-bold ${
                          rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                          rank === 2 ? "bg-slate-400/20 text-slate-300" :
                          rank === 3 ? "bg-amber-600/20 text-amber-500" :
                          "text-text-muted"
                        }`}>
                          {rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {owner ? (
                          <span className="font-medium">{owner}</span>
                        ) : (
                          <span className="text-text-muted italic">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/cards/${card.cardNumber}`} className="font-mono text-sm text-text-muted hover:text-primary transition-colors">
                          {maskCard(card.cardNumber)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-primary">{card.sum.toFixed(0)} kr</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-text-muted mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold truncate">{value}</div>
    </div>
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
