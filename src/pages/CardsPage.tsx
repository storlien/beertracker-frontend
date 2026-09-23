import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CardsPage() {
  const [search, setSearch] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const trimmed = search.trim();
    if (!trimmed || trimmed.length !== 10 || !/^\d+$/.test(trimmed)) return;
    setIsChecking(true);
    try {
      const d = await getDoc(doc(db, "cards", trimmed));
      if (d.exists()) {
        navigate(`/cards/${trimmed}`);
      } else {
        toast.error("Card not found");
      }
    } catch {
      toast.error("Error looking up card");
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-primary" />
        Card Lookup
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Find a Card</CardTitle>
          <CardDescription>
            Enter a 10-digit card number to view its details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 1234567890"
              maxLength={10}
              className="flex-1 font-mono"
            />
            <Button
              onClick={handleSearch}
              disabled={isChecking}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {search.length > 0 && search.length !== 10 && (
            <p className="text-xs text-muted-foreground">
              Card number must be exactly 10 digits.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
