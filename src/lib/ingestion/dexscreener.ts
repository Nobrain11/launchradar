/**
 * DexScreener public API adapter.
 * Uses token-profiles/latest (often contains social links) + pair enrichment.
 */

import { ChainId } from "@/types";
import { validateTelegramUrl } from "@/lib/telegram";

const DS_BASE = "https://api.dexscreener.com";

const CHAIN_MAP: Record<string, ChainId> = {
  solana: "solana",
  ethereum: "ethereum",
  eth: "ethereum",
  base: "base",
  bsc: "bsc",
  bnbt: "bsc",
};

export interface DsRawToken {
  chainId: ChainId;
  name: string;
  symbol: string;
  address: string;
  priceUsd: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
  launchTime: string;
  logoUrl?: string;
  socials: {
    telegram?: string;
    twitter?: string;
    website?: string;
    discord?: string;
  };
  dataSource: string;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "LaunchRadar/1.0",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchLatestTokenProfiles(): Promise<DsRawToken[]> {
  const data = await fetchJson<
    Array<{
      url?: string;
      chainId?: string;
      tokenAddress?: string;
      icon?: string;
      header?: string;
      description?: string;
      links?: Array<{ type?: string; label?: string; url?: string }>;
    }>
  >(`${DS_BASE}/token-profiles/latest/v1`);

  if (!Array.isArray(data)) return [];

  const results: DsRawToken[] = [];

  for (const profile of data) {
    const chainRaw = (profile.chainId || "").toLowerCase();
    const chainId = CHAIN_MAP[chainRaw];
    if (!chainId || !profile.tokenAddress) continue;

    const socials: DsRawToken["socials"] = {};
    for (const link of profile.links || []) {
      const url = link.url || "";
      const type = (link.type || link.label || "").toLowerCase();
      if (type.includes("telegram") || url.includes("t.me") || url.includes("telegram.me")) {
        const v = validateTelegramUrl(url);
        if (v.valid) socials.telegram = v.normalized;
      } else if (
        type.includes("twitter") ||
        type.includes("x") ||
        url.includes("x.com") ||
        url.includes("twitter.com")
      ) {
        socials.twitter = url;
      } else if (type.includes("website") || type.includes("web")) {
        socials.website = url;
      } else if (type.includes("discord")) {
        socials.discord = url;
      }
    }

    if (!socials.telegram && profile.description) {
      const match = profile.description.match(
        /https?:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]+/i
      );
      if (match) {
        const v = validateTelegramUrl(match[0]);
        if (v.valid) socials.telegram = v.normalized;
      }
    }

    // header is often a banner image URL — prefer description for name/symbol
    let name = profile.tokenAddress.slice(0, 8);
    let symbol = "???";
    if (profile.description) {
      const firstLine = profile.description.split("\n")[0].trim();
      const tickerMatch = firstLine.match(/\(\$([A-Za-z0-9]{2,12})\)/);
      if (tickerMatch) symbol = tickerMatch[1].toUpperCase();
      name = firstLine.replace(/\s+/g, " ").slice(0, 48);
      if (!tickerMatch) {
        const words = firstLine.split(/\s+/).filter(Boolean);
        if (
          words[0] &&
          words[0].length <= 12 &&
          /^[A-Za-z0-9$]+$/.test(words[0].replace("$", ""))
        ) {
          symbol = words[0].replace("$", "").toUpperCase();
        }
      }
    } else if (profile.header && !profile.header.startsWith("http")) {
      name = profile.header.slice(0, 48);
      symbol = profile.header.slice(0, 12).toUpperCase();
    }

    results.push({
      chainId,
      name,
      symbol,
      address: profile.tokenAddress,
      priceUsd: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0,
      launchTime: new Date().toISOString(),
      logoUrl: profile.icon,
      socials,
      dataSource: "DexScreener Profiles",
    });
  }

  return results;
}

export async function enrichWithPairData(
  chainId: ChainId,
  tokenAddress: string
): Promise<Partial<DsRawToken> | null> {
  const dsChain =
    chainId === "ethereum" ? "ethereum" : chainId === "bsc" ? "bsc" : chainId;
  const data = await fetchJson<{
    pairs?: Array<{
      priceUsd?: string;
      fdv?: number;
      marketCap?: number;
      liquidity?: { usd?: number };
      volume?: { h24?: number };
      priceChange?: { h24?: number };
      pairCreatedAt?: number;
      baseToken?: { name?: string; symbol?: string };
    }>;
  }>(`${DS_BASE}/token-pairs/v1/${dsChain}/${tokenAddress}`);

  const pair = data?.pairs?.[0];
  if (!pair) return null;

  return {
    name: pair.baseToken?.name,
    symbol: pair.baseToken?.symbol,
    priceUsd: parseFloat(pair.priceUsd || "0") || 0,
    marketCap: pair.marketCap || pair.fdv || 0,
    liquidity: pair.liquidity?.usd || 0,
    volume24h: pair.volume?.h24 || 0,
    priceChange24h: pair.priceChange?.h24 || 0,
    launchTime: pair.pairCreatedAt
      ? new Date(pair.pairCreatedAt).toISOString()
      : undefined,
  };
}
