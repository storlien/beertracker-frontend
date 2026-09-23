import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { CreditCard, TrendingUp, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Card as CardType } from "../types";

export function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardId) return;

    const unsub = onSnapshot(doc(db, "cards", cardId), (d) => {
      if (d.exists()) {
        setCard({ cardNumber: d.id, ...d.data() } as CardType);
      } else {
        setCard(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [cardId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-20">
        <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Card not found</h2>
        <p className="text-muted-foreground">The card {cardId} does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Card Details</CardTitle>
              <CardDescription className="font-mono">{maskCard(card.cardNumber)}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Total Spent</span>
                </div>
                <div className="text-2xl font-bold text-primary">{card.sum.toFixed(0)} kr</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Status</span>
                </div>
                <div className="text-sm mt-1">
                  {card.linkedUserId ? (
                    <Badge variant="default">Linked to user</Badge>
                  ) : (
                    <Badge variant="secondary">Unlinked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {card.lastPurchaseHash && (
            <p className="text-xs text-muted-foreground">
              Last processed: {card.lastPurchaseHash.slice(0, 30)}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function maskCard(cardNumber: string) {
  if (cardNumber.length !== 10) return cardNumber;
  return cardNumber.slice(0, 6) + "****";
}
