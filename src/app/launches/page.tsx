"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Filters, SortOption } from "@/components/Filters";
import { TokenCard } from "@/components/TokenCard";
import { searchTokens } from "@/lib/demo-data";

export default function LaunchesPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [chain, setChain] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [maxAgeHours, setMaxAgeHours] = useState<number | undefined>(undefined);
  const [minLiquidity, setMinLiquidity] = useState<number | undefined>(undefined);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const results = useMemo(
    () =>
      searchTokens(
        query,
        {
          chain: chain === "all" ? undefined : chain,
          maxAgeHours,
          minLiquidity,
        },
        sort
      ),
    [query, chain, sort, maxAgeHours, minLiquidity]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Launches</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Tokens with validated public Telegram links only. Telegram filter is always on.
        </p>
      </div>

      <Filters
        query={query}
        onQueryChange={setQuery}
        chain={chain}
        onChainChange={setChain}
        sort={sort}
        onSortChange={setSort}
        maxAgeHours={maxAgeHours}
        onMaxAgeChange={setMaxAgeHours}
        minLiquidity={minLiquidity}
        onMinLiquidityChange={setMinLiquidity}
      />

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Showing <strong className="text-foreground">{results.length}</strong> tokens
        </span>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <p className="text-foreground-muted">No tokens match your filters.</p>
          <p className="mt-1 text-xs text-muted">
            All listed tokens must have a valid public Telegram link.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
