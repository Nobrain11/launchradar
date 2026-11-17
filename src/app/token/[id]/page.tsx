"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  MessageCircle,
  Twitter,
  Globe,
  MessageSquare,
  Star,
  AlertTriangle,
  Check,
} from "lucide-react";
import { getTokenById } from "@/lib/demo-data";
import { getChain, getExplorerUrl } from "@/lib/chains";
import {
  formatUsd,
  formatPercent,
  formatAge,
  formatTimestamp,
  copyToClipboard,
} from "@/lib/utils";
import { useState, useEffect } from "react";

export default function TokenDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const token = getTokenById(id);
  const [copied, setCopied] = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("launchradar-watchlist");
    if (raw) {
      try {
        const list: string[] = JSON.parse(raw);
        setWatched(list.includes(id));
      } catch {
        /* ignore */
      }
    }
  }, [id]);

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-foreground-muted">Token not found.</p>
        <Link href="/launches" className="mt-4 inline-block text-accent hover:underline">
          ← Back to launches
        </Link>
      </div>
    );
  }

  const chain = getChain(token.chainId);
  const positive = token.priceChange24h >= 0;

  const handleCopy = async () => {
    const ok = await copyToClipboard(token.contractAddress);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const toggleWatch = () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("launchradar-watchlist");
    let list: string[] = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    if (watched) {
      list = list.filter((x) => x !== id);
    } else {
      list.push(id);
    }
    localStorage.setItem("launchradar-watchlist", JSON.stringify(list));
    setWatched(!watched);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <Link
        href="/launches"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to launches
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-background"
            style={{ backgroundColor: chain.color }}
          >
            {token.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{token.name}</h1>
              <span className="rounded bg-card px-2 py-0.5 text-sm text-foreground-muted">
                ${token.symbol}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs font-medium uppercase"
                style={{ backgroundColor: `${chain.color}22`, color: chain.color }}
              >
                {chain.name}
              </span>
              {token.isDemo && (
                <span className="rounded bg-warning/10 px-2 py-0.5 text-xs text-warning">
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">
              Launched {formatAge(token.launchTime)} ago · {formatTimestamp(token.launchTime)}
            </p>
          </div>
        </div>

        <button
          onClick={toggleWatch}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            watched
              ? "border-accent/40 bg-accent/15 text-accent"
              : "border-border bg-card text-foreground-muted hover:border-border-light hover:text-foreground"
          }`}
        >
          <Star className={`h-4 w-4 ${watched ? "fill-current" : ""}`} />
          {watched ? "Watching" : "Add to Watchlist"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Price", value: formatUsd(token.priceUsd) },
          {
            label: "24h Change",
            value: formatPercent(token.priceChange24h),
            color: positive ? "text-accent" : "text-danger",
          },
          { label: "Market Cap", value: formatUsd(token.marketCap) },
          { label: "Liquidity", value: formatUsd(token.liquidity) },
          { label: "Volume 24h", value: formatUsd(token.volume24h) },
          { label: "Age", value: formatAge(token.launchTime) },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted">{m.label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${m.color ?? "text-foreground"}`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Contract Address
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="break-all font-mono text-sm text-foreground">
            {token.contractAddress}
          </code>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md bg-card-hover px-2 py-1 text-xs hover:bg-border"
          >
            {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={getExplorerUrl(token.chainId, token.contractAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-card-hover px-2 py-1 text-xs hover:bg-border"
          >
            Explorer <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Price Chart</p>
        <div className="mt-3 flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background text-sm text-muted">
          Chart area — connect live price feed for real data
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Community & Links
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {token.telegramNormalized && (
            <a
              href={token.telegramNormalized}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-accent/15 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/25"
            >
              <MessageCircle className="h-4 w-4" />
              Telegram Group
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}
          {token.socials.twitter && (
            <a
              href={token.socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-hover px-4 py-2 text-sm hover:border-border-light"
            >
              <Twitter className="h-4 w-4" />
              X / Twitter
            </a>
          )}
          {token.socials.website && (
            <a
              href={token.socials.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-hover px-4 py-2 text-sm hover:border-border-light"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
          )}
          {token.socials.discord && (
            <a
              href={token.socials.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-hover px-4 py-2 text-sm hover:border-border-light"
            >
              <MessageSquare className="h-4 w-4" />
              Discord
            </a>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-semibold">Risk Indicators</p>
        </div>
        <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
          {token.riskFlags.map((f) => (
            <li key={f.type}>• {f.label}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Newly launched tokens are highly speculative. Presence of a Telegram group does
          not indicate legitimacy or safety. Always conduct independent research.
        </p>
      </div>

      <div className="text-xs text-muted">
        Data source: {token.dataSource} · Last updated: {formatTimestamp(token.lastUpdated)}
      </div>
    </div>
  );
}
