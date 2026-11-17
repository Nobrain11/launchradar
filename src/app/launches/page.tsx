"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Filters, SortOption } from "@/components/Filters";
import { TokenCard } from "@/components/TokenCard";
import { Token, DashboardStats } from "@/types";
import { DEMO_TOKENS } from "@/lib/demo-data";

export default function LaunchesPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [chain, setChain] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [maxAgeHours, setMaxAgeHours] = useState<number | undefined>(undefined);
  const [minLiquidity, setMinLiquidity] = useState<number | undefined>(undefined);

  const [tokens, setTokens] = useState<Token[]>(DEMO_TOKENS);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/tokens");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setTokens(data.tokens || DEMO_TOKENS);
          setStats(data.stats || null);
          setIsLive(Boolean(data.isLive));
        }
      } catch {
        if (!cancelled) {
          setTokens(DEMO_TOKENS);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const results = useMemo(() => {
    let list = tokens.filter((t) => t.telegramValidated);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.contractAddress.toLowerCase().includes(q)
      );
    }
    if (chain !== "all") list = list.filter((t) => t.chainId === chain);
    if (minLiquidity !== undefined) list = list.filter((t) => t.liquidity >= minLiquidity);
    if (maxAgeHours !== undefined) {
      const cutoff = Date.now() - maxAgeHours * 3600 * 1000;
      list = list.filter((t) => new Date(t.launchTime).getTime() >= cutoff);
    }
    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime());
        break;
      case "liquidity":
        list = [...list].sort((a, b) => b.liquidity - a.liquidity);
        break;
      case "volume":
        list = [...list].sort((a, b) => b.volume24h - a.volume24h);
        break;
      case "mcap":
        list = [...list].sort((a, b) => b.marketCap - a.marketCap);
        break;
    }
    return list;
  }, [tokens, query, chain, sort, maxAgeHours, minLiquidity]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Launches</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Tokens with validated public Telegram links only. Telegram filter is always on.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {loading ? (
            <span className="text-muted">Loading…</span>
          ) : isLive ? (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-medium text-accent">
              Live data
            </span>
          ) : (
            <span className="rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 font-medium text-warning">
              Demo data
            </span>
          )}
          {stats && (
            <span className="text-muted">
              {stats.withTelegram} with TG · {stats.totalLaunches} seen
            </span>
          )}
        </div>
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
