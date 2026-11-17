"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import { SUPPORTED_CHAINS, CHAINS } from "@/lib/chains";

export type SortOption = "newest" | "liquidity" | "volume" | "mcap";

interface FiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  chain: string;
  onChainChange: (c: string) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  maxAgeHours: number | undefined;
  onMaxAgeChange: (h: number | undefined) => void;
  minLiquidity: number | undefined;
  onMinLiquidityChange: (v: number | undefined) => void;
}

export function Filters({
  query,
  onQueryChange,
  chain,
  onChainChange,
  sort,
  onSortChange,
  maxAgeHours,
  onMaxAgeChange,
  minLiquidity,
  onMinLiquidityChange,
}: FiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="h-4 w-4 text-accent" />
        Filters & Search
        <span className="ml-auto rounded bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase text-accent">
          Telegram required
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Name, symbol, or contract address…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-muted">Chain</label>
          <select
            value={chain}
            onChange={(e) => onChainChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="all">All chains</option>
            {SUPPORTED_CHAINS.map((id) => (
              <option key={id} value={id}>
                {CHAINS[id].name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Max age</label>
          <select
            value={maxAgeHours ?? ""}
            onChange={(e) =>
              onMaxAgeChange(e.target.value ? Number(e.target.value) : undefined)
            }
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Any age</option>
            <option value="1">Last 1 hour</option>
            <option value="6">Last 6 hours</option>
            <option value="24">Last 24 hours</option>
            <option value="72">Last 3 days</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Min liquidity</label>
          <select
            value={minLiquidity ?? ""}
            onChange={(e) =>
              onMinLiquidityChange(e.target.value ? Number(e.target.value) : undefined)
            }
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            <option value="10000">$10K+</option>
            <option value="25000">$25K+</option>
            <option value="50000">$50K+</option>
            <option value="100000">$100K+</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">
            <ArrowUpDown className="mr-1 inline h-3 w-3" />
            Sort by
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="liquidity">Liquidity</option>
            <option value="volume">Volume 24h</option>
            <option value="mcap">Market Cap</option>
          </select>
        </div>
      </div>
    </div>
  );
}
