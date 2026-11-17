"use client";

import { useEffect, useState } from "react";
import { Database, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { DataSourceStatus, DashboardStats } from "@/types";
import { formatTimestamp } from "@/lib/utils";
import { DEMO_DATA_SOURCES, DEMO_STATS } from "@/lib/demo-data";

export default function AdminPage() {
  const [sources, setSources] = useState<DataSourceStatus[]>(DEMO_DATA_SOURCES);
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) {
          setSources(data.sources || DEMO_DATA_SOURCES);
          setStats(data.stats || DEMO_STATS);
          setIsLive(Boolean(data.isLive));
        }
      } catch {
        /* keep demo */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Database className="h-6 w-6 text-accent" />
          Data Sources
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Internal health dashboard. {loading ? "Loading…" : isLive ? "Live ingestion active." : "Running on demo data."}
        </p>
      </div>

      {!isLive && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          <strong>Demo / fallback mode.</strong> Live providers returned no tokens with
          valid public Telegram links (or requests failed). Sample data is shown so the UI
          remains usable. Never treat demo records as live market data.
        </div>
      )}

      {isLive && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-accent">
          <strong>Live mode.</strong> Tokens below passed Telegram validation from
          GeckoTerminal and/or DexScreener.
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Connected Providers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sources.map((src) => (
            <div key={src.provider} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{src.provider}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    src.connected ? "bg-accent/15 text-accent" : "bg-muted/20 text-muted"
                  }`}
                >
                  {src.connected ? (
                    <><CheckCircle2 className="h-3 w-3" /> Connected</>
                  ) : (
                    <><XCircle className="h-3 w-3" /> Offline / Demo</>
                  )}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted">Last sync</dt>
                  <dd>{src.lastSync ? formatTimestamp(src.lastSync) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Fetched</dt>
                  <dd>{src.tokensFetched}</dd>
                </div>
                <div>
                  <dt className="text-muted">Rejected (no TG)</dt>
                  <dd className="text-warning">{src.tokensRejectedNoTelegram}</dd>
                </div>
                <div>
                  <dt className="text-muted">Invalid links</dt>
                  <dd>{src.invalidLinks}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Telegram Gate Summary
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-semibold">{stats.totalLaunches}</p>
            <p className="text-xs text-muted">Total seen</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-accent">{stats.withTelegram}</p>
            <p className="text-xs text-muted">Accepted (valid TG)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-warning">
              {Math.max(0, stats.totalLaunches - stats.withTelegram)}
            </p>
            <p className="text-xs text-muted">Rejected (no/invalid TG)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{stats.chainsRepresented}</p>
            <p className="text-xs text-muted">Chains</p>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-card/50 p-3 text-xs text-muted">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          In production, protect this route with authentication. Telegram validation is
          enforced before any token enters the public feed.
        </p>
      </div>
    </div>
  );
}
