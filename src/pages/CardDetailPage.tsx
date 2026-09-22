import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { CreditCard, TrendingUp, Hash } from "lucide-react";
import type { Card } from "../types";

export function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardId) return;

    const unsub = onSnapshot(doc(db, "cards", cardId), (d) => {
      if (d.exists()) {
        setCard({ cardNumber: d.id, ...d.data() } as Card);
      } else {
        setCard(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [cardId]);

  if (loading) {
    return <div className="text-center py-20 text-text-muted">Loading card...</div>;
  }

  if (!card) {
    return (
      <div className="text-center py-20">
        <CreditCard className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Card not found</h2>
        <p className="text-text-muted">The card {cardId} does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Card Details</h1>
            <p className="text-sm text-text-muted font-mono">{maskCard(card.cardNumber)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-primary">{card.sum.toFixed(0)} kr</div>
          </div>

          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Hash className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Status</span>
            </div>
            <div className="text-sm">
              {card.linkedUserId ? (
                <span className="text-primary">Linked to user</span>
              ) : (
                <span className="text-text-muted">Unlinked</span>
              )}
            </div>
          </div>
        </div>

        {card.lastPurchaseHash && (
          <div className="text-xs text-text-muted">
            Last processed: {card.lastPurchaseHash.slice(0, 30)}...
          </div>
        )}
      </div>
    </div>
  );
}

function maskCard(cardNumber: string) {
  if (cardNumber.length !== 10) return cardNumber;
  return cardNumber.slice(0, 6) + "****";
}
