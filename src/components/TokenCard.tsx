"use client";

import Link from "next/link";
import {
  Copy,
  ExternalLink,
  MessageCircle,
  Twitter,
  Globe,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Token } from "@/types";
import { getChain } from "@/lib/chains";
import {
  cn,
  formatUsd,
  formatPercent,
  formatAge,
  shortenAddress,
  copyToClipboard,
} from "@/lib/utils";
import { useState } from "react";

interface TokenCardProps {
  token: Token;
  compact?: boolean;
}

export function TokenCard({ token }: TokenCardProps) {
  const chain = getChain(token.chainId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyToClipboard(token.contractAddress);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const positive = token.priceChange24h >= 0;

  return (
    <Link
      href={`/token/${token.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-4 transition-all hover:border-border-light hover:bg-card-hover",
        "animate-fade-in"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-background"
          style={{ backgroundColor: chain.color }}
        >
          {token.symbol.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground group-hover:text-accent">
              {token.name}
            </h3>
            <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs font-medium text-foreground-muted">
              ${token.symbol}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
              style={{
                backgroundColor: `${chain.color}22`,
                color: chain.color,
              }}
            >
              {chain.shortName}
            </span>
            {token.isDemo && (
              <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] text-warning">
                DEMO
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 font-mono hover:text-foreground"
              title="Copy contract"
            >
              {shortenAddress(token.contractAddress)}
              {copied ? (
                <Check className="h-3 w-3 text-accent" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <span>Age: {formatAge(token.launchTime)}</span>
          </div>
        </div>

        <div className="text-right">
          <p
            className={cn(
              "text-sm font-semibold",
              positive ? "text-accent" : "text-danger"
            )}
          >
            {formatPercent(token.priceChange24h)}
          </p>
          <p className="text-xs text-muted">{formatUsd(token.priceUsd)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
        <div>
          <p className="text-muted">MCap</p>
          <p className="font-medium text-foreground">{formatUsd(token.marketCap)}</p>
        </div>
        <div>
          <p className="text-muted">Liquidity</p>
          <p className="font-medium text-foreground">{formatUsd(token.liquidity)}</p>
        </div>
        <div>
          <p className="text-muted">Vol 24h</p>
          <p className="font-medium text-foreground">{formatUsd(token.volume24h)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {token.telegramNormalized && (
            <a
              href={token.telegramNormalized}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/25"
            >
              <MessageCircle className="h-3 w-3" />
              Telegram
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </a>
          )}
          {token.socials.twitter && (
            <a
              href={token.socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1.5 text-muted hover:bg-card-hover hover:text-foreground"
              title="X / Twitter"
            >
              <Twitter className="h-3.5 w-3.5" />
            </a>
          )}
          {token.socials.website && (
            <a
              href={token.socials.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1.5 text-muted hover:bg-card-hover hover:text-foreground"
              title="Website"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {token.riskFlags.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-warning">
            <AlertTriangle className="h-3 w-3" />
            <span>{token.riskFlags[0].label}</span>
            {token.riskFlags.length > 1 && (
              <span className="text-muted">+{token.riskFlags.length - 1}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
