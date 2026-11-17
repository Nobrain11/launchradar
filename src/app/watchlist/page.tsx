"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { TokenCard } from "@/components/TokenCard";
import { DEMO_TOKENS } from "@/lib/demo-data";
import { Token } from "@/types";

export default function WatchlistPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("launchradar-watchlist");
    let ids: string[] = [];
    try {
      ids = raw ? JSON.parse(raw) : [];
    } catch {
      ids = [];
    }
    const watched = DEMO_TOKENS.filter((t) => ids.includes(t.id));
    setTokens(watched);
    setLoaded(true);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Star className="h-6 w-6 text-accent" />
          Watchlist
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Tokens you saved. Stored in local browser storage for this MVP.
        </p>
      </div>

      {!loaded ? (
        <div className="py-16 text-center text-muted">Loading…</div>
      ) : tokens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Star className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-foreground-muted">Your watchlist is empty.</p>
          <Link
            href="/launches"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Browse launches →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
