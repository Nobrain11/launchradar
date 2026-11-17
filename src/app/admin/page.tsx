import { Database, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { DEMO_DATA_SOURCES, DEMO_INGESTION_RUNS, DEMO_STATS } from "@/lib/demo-data";
import { formatTimestamp } from "@/lib/utils";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Database className="h-6 w-6 text-accent" />
          Data Sources
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Internal health dashboard. Protected in production. Currently showing demo
          ingestion metrics.
        </p>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
        <strong>Demo mode active.</strong> No live API credentials configured. Sample
        ingestion runs are displayed for UI development. Never present sample data as
        real-time market data.
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Connected Providers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DEMO_DATA_SOURCES.map((src) => (
            <div
              key={src.provider}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{src.provider}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    src.connected
                      ? "bg-accent/15 text-accent"
                      : "bg-muted/20 text-muted"
                  }`}
                >
                  {src.connected ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" /> Demo / Offline
                    </>
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
            <p className="text-2xl font-semibold">{DEMO_STATS.totalLaunches}</p>
            <p className="text-xs text-muted">Total seen</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-accent">{DEMO_STATS.withTelegram}</p>
            <p className="text-xs text-muted">Accepted (valid TG)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-warning">
              {DEMO_STATS.totalLaunches - DEMO_STATS.withTelegram}
            </p>
            <p className="text-xs text-muted">Rejected (no/invalid TG)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">4</p>
            <p className="text-xs text-muted">Chains</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Recent Ingestion Runs
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fetched</th>
                <th className="px-4 py-3">Accepted</th>
                <th className="px-4 py-3">Rejected (no TG)</th>
                <th className="px-4 py-3">Finished</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card/50">
              {DEMO_INGESTION_RUNS.map((run) => (
                <tr key={run.id}>
                  <td className="px-4 py-3 font-medium">{run.provider}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        run.status === "success"
                          ? "bg-accent/15 text-accent"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{run.tokensFetched}</td>
                  <td className="px-4 py-3 text-accent">{run.tokensAccepted}</td>
                  <td className="px-4 py-3 text-warning">{run.tokensRejectedNoTelegram}</td>
                  <td className="px-4 py-3 text-muted">
                    {run.finishedAt ? formatTimestamp(run.finishedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-card/50 p-3 text-xs text-muted">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          In production, protect this route with authentication (Supabase Auth or similar).
          API keys for DexScreener / GeckoTerminal must remain server-side only.
        </p>
      </div>
    </div>
  );
}
