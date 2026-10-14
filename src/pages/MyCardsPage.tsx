import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { claimCard, unclaimCard } from "../lib/cardClaims";
import { toast } from "sonner";
import { Wallet, Plus, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MyCardsPage() {
  const { user, profile, profileReady } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleClaim = async () => {
    const trimmed = cardNumber.trim();
    if (!profile) return;
    if (!/^\d{10}$/.test(trimmed)) {
      toast.error("Card number must be exactly 10 digits");
      return;
    }
    setBusy(true);
    try {
      await claimCard(profile.id, trimmed);
      toast.success(`Card ${trimmed} claimed`);
      setCardNumber("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to claim card");
    } finally {
      setBusy(false);
    }
  };

  const handleUnclaim = async (card: string) => {
    if (!profile) return;
    if (!confirm(`Remove card ${card} from your profile?`)) return;
    try {
      await unclaimCard(profile.id, card);
      toast.success(`Card ${card} removed`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove card");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 text-primary">
          <Wallet className="w-5 h-5" />
        </span>
        My Cards
      </h1>

      {!profileReady ? (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
        </Card>
      ) : !profile ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No Abakus profile is linked to this account. Log in with
              Abakus to manage your cards.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {profile.firstName} {profile.lastName}
            </span>
            . Cards you claim will be counted in your name on the
            leaderboard.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Claim a card</CardTitle>
              <CardDescription>
                Enter a 10-digit card number to link it to your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClaim();
                  }}
                  placeholder="e.g. 1234567890"
                  maxLength={10}
                  className="flex-1 font-mono"
                />
                <Button onClick={handleClaim} disabled={busy || cardNumber.length !== 10}>
                  <Plus className="w-4 h-4" />
                  Claim
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your cards ({profile.cards.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.cards.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">
                  You have not claimed any cards yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.cards.map((card) => (
                    <div
                      key={card}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary border rounded font-mono text-xs"
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      <Link to={`/cards/${card}`} className="hover:text-primary">
                        {card}
                      </Link>
                      <button
                        onClick={() => handleUnclaim(card)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        title="Remove card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
