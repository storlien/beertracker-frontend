import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Search, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { Card } from "../types";

export function CardsPage() {
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
    // We don't load all cards here; only search when typing
  }, []);

  const handleSearch = async () => {
    const trimmed = search.trim();
    if (!trimmed) return;

    if (trimmed.length === 10 && /^\d+$/.test(trimmed)) {
      navigate(`/cards/${trimmed}`);
      return;
    }

    try {
      const d = await getDoc(doc(db, "cards", trimmed));
      if (d.exists()) {
        navigate(`/cards/${trimmed}`);
      } else {
        toast.error("Card not found");
      }
    } catch {
      toast.error("Error looking up card");
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

      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <p className="text-sm text-text-muted">
          Enter a 10-digit card number to view its details.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 1234567890"
            maxLength={10}
            className="flex-1 px-4 py-3 bg-background border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {search.length > 0 && search.length !== 10 && (
          <p className="text-xs text-text-muted">
            Card number must be exactly 10 digits.
          </p>
        )}
      </div>
    </div>
  );
}
