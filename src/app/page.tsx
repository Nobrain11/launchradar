import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { TokenCard } from "@/components/TokenCard";
import { DEMO_STATS, DEMO_TOKENS } from "@/lib/demo-data";

export default function DashboardPage() {
  const latest = DEMO_TOKENS.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <MessageCircle className="h-3.5 w-3.5" />
          Telegram-first discovery
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

      <StatsCards stats={DEMO_STATS} />

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
          {latest.map((token) => (
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
            Demo data is clearly labeled. Live data requires configured API keys.
          </li>
        </ul>
      </section>
    </div>
  );
}
