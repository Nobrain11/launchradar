"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { TokenCard } from "@/components/TokenCard";
import { Token, DashboardStats } from "@/types";
import { DEMO_STATS, DEMO_TOKENS } from "@/lib/demo-data";

export default function DashboardPage() {
  const [tokens, setTokens] = useState<Token[]>(DEMO_TOKENS.slice(0, 6));
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/tokens");
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) {
          setTokens((data.tokens || DEMO_TOKENS).slice(0, 6));
          setStats(data.stats || DEMO_STATS);
          setIsLive(Boolean(data.isLive));
        }
      } catch {
        /* keep demo */
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <MessageCircle className="h-3.5 w-3.5" />
          Telegram-first discovery
          {isLive ? (
            <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px]">LIVE</span>
          ) : (
            <span className="ml-1 rounded bg-warning/20 px-1.5 py-0.5 text-[10px] text-warning">
              DEMO
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Discover launches with{" "}
          <span className="text-accent">real community signals</span>
        </h1>
        <p className="max-w-2xl text-foreground-muted">
          LaunchRadar surfaces newly launched tokens across Solana, Ethereum, Base, and
          BNB Chain — but only if they have a valid public Telegram group or channel.
          No Telegram, no listing.
        </p>
      </section>

      <StatsCards stats={stats} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest launches</h2>
          <Link
            href="/launches"
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Product rules
        </h2>
        <ul className="space-y-2 text-sm text-foreground-muted">
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            Only tokens with a valid public Telegram group/channel appear in the feed.
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            Telegram links are validated and normalized before listing.
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            Risk indicators are always visible. No token is marked “safe”.
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            Live data from GeckoTerminal + DexScreener when available; otherwise clearly labeled demo.
          </li>
        </ul>
      </section>
    </div>
  );
}
