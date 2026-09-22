import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, doc, onSnapshot, query, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase";
import { Trophy, Clock, Users, AlertTriangle, Info } from "lucide-react";
import type { Card, User, SyncState } from "../types";

interface LeaderboardEntry {
  id: string;
  name: string;
  isUser: boolean;
  sum: number;
  cards: string[];
}

export function Leaderboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "cards"), orderBy("sum", "desc"), limit(250));
    const unsubCards = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ cardNumber: d.id, ...d.data() }) as Card);
        setCards(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore cards error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

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
        if (d.exists()) setSyncState(d.data() as SyncState);
      },
      (err) => console.error("Firestore state error:", err)
    );

    return () => {
      unsubCards();
      unsubUsers();
      unsubState();
    };
  }, []);

  // Build ownership map: cardNumber -> {userId, name}
  const cardOwnerMap = useMemo(() => {
    const map: Record<string, { userId: string; name: string }> = {};
    Object.values(users).forEach((user) => {
      user.cards?.forEach((cardNum) => {
        map[cardNum] = { userId: user.id, name: `${user.firstName} ${user.lastName}` };
      });
    });
    return map;
  }, [users]);

  // Build leaderboard: aggregate by user + unlinked cards
  const entries = useMemo<LeaderboardEntry[]>(() => {
    const userSums: Record<string, { sum: number; cards: string[] }> = {};
    const unlinked: LeaderboardEntry[] = [];

    for (const card of cards) {
      const owner = cardOwnerMap[card.cardNumber];
      if (owner) {
        if (!userSums[owner.userId]) {
          userSums[owner.userId] = { sum: 0, cards: [] };
        }
        userSums[owner.userId].sum += card.sum;
        userSums[owner.userId].cards.push(card.cardNumber);
      } else {
        unlinked.push({
          id: card.cardNumber,
          name: "Unknown",
          isUser: false,
          sum: card.sum,
          cards: [card.cardNumber],
        });
      }
    }

    const userEntries: LeaderboardEntry[] = Object.entries(userSums).map(
      ([userId, data]) => {
        const user = users[userId];
        return {
          id: userId,
          name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          isUser: true,
          sum: data.sum,
          cards: data.cards,
        };
      }
    );

    return [...userEntries, ...unlinked]
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 100);
  }, [cards, cardOwnerMap, users]);

  const totalSpent = useMemo(
    () => cards.reduce((sum, c) => sum + c.sum, 0),
    [cards]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Trophy} label="Total Spent" value={`${totalSpent.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`} />
        <StatCard icon={Users} label="No. cards used" value={totalCards.toLocaleString()} />
        <StatCard icon={Clock} label="Last Sync" value={syncState?.lastSyncAt ? formatTime(syncState.lastSyncAt) : "Never"} />
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-text">
            Data includes all historical purchases from 16 October 2020.
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

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </h2>
          <span className="text-sm text-text-muted">Top 100</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No cards yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-muted">
                  <th className="px-4 py-2 w-12">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Cards</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
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
                        <span className={`font-medium ${entry.isUser ? "" : "text-text-muted italic"}`}>
                          {entry.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {entry.cards.map((c) => (
                            <Link
                              key={c}
                              to={`/cards/${c}`}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-surface-hover border border-border rounded hover:border-primary transition-colors font-mono"
                            >
                              {maskCard(c)}
                            </Link>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-primary">{entry.sum.toFixed(0)} kr</span>
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
