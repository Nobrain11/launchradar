/**
 * GeckoTerminal public API adapter.
 * Fetches newly created pools and normalizes them for LaunchRadar.
 */

import { ChainId } from "@/types";
import { validateTelegramUrl } from "@/lib/telegram";

const GT_BASE = "https://api.geckoterminal.com/api/v2";

const NETWORK_MAP: Record<ChainId, string> = {
  solana: "solana",
  ethereum: "eth",
  base: "base",
  bsc: "bsc",
};

export interface RawPoolToken {
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

function extractSocials(attrs: Record<string, unknown>): RawPoolToken["socials"] {
  const socials: RawPoolToken["socials"] = {};
  const candidates: (string | undefined)[] = [
    attrs.telegram as string | undefined,
    attrs.telegram_handle as string | undefined,
    attrs.socials && typeof attrs.socials === "object"
      ? ((attrs.socials as Record<string, string>).telegram ||
          (attrs.socials as Record<string, string>).Telegram)
      : undefined,
  ];
  for (const c of candidates) {
    if (c) {
      const v = validateTelegramUrl(c);
      if (v.valid) {
        socials.telegram = v.normalized;
        break;
      }
    }
  }
  const tw =
    (attrs.twitter_handle as string) ||
    (attrs.twitter as string) ||
    (attrs.socials && typeof attrs.socials === "object"
      ? (attrs.socials as Record<string, string>).twitter
      : undefined);
  if (tw) {
    socials.twitter = tw.startsWith("http") ? tw : `https://x.com/${tw.replace("@", "")}`;
  }
  const web =
    (attrs.websites as string[] | undefined)?.[0] ||
    (attrs.website as string) ||
    (attrs.socials && typeof attrs.socials === "object"
      ? (attrs.socials as Record<string, string>).website
      : undefined);
  if (web) socials.website = web;
  return socials;
}

export async function fetchNewPoolsForChain(
  chainId: ChainId,
  page = 1
): Promise<RawPoolToken[]> {
  const network = NETWORK_MAP[chainId];
  if (!network) return [];
  const url = `${GT_BASE}/networks/${network}/new_pools?page=${page}&include=base_token`;
  const data = await fetchJson<{
    data?: Array<{
      id: string;
      attributes?: Record<string, unknown>;
      relationships?: Record<string, { data?: { id: string } }>;
    }>;
    included?: Array<{
      id: string;
      type: string;
      attributes?: Record<string, unknown>;
    }>;
  }>(url);
  if (!data?.data?.length) return [];
  const includedMap = new Map<string, Record<string, unknown>>();
  for (const item of data.included || []) {
    if (item.id && item.attributes) includedMap.set(item.id, item.attributes);
  }
  const results: RawPoolToken[] = [];
  for (const pool of data.data) {
    const attrs = pool.attributes || {};
    const baseRel = pool.relationships?.base_token?.data?.id;
    const tokenAttrs = baseRel ? includedMap.get(baseRel) || {} : {};
    const address =
      (tokenAttrs.address as string) ||
      (attrs.base_token_address as string) ||
      "";
    if (!address) continue;
    const name =
      (tokenAttrs.name as string) ||
      (attrs.name as string)?.split(" / ")[0] ||
      "Unknown";
    const symbol =
      (tokenAttrs.symbol as string) ||
      (attrs.name as string)?.split(" / ")[0] ||
      "???";
    const priceUsd = parseFloat(String(attrs.base_token_price_usd || "0")) || 0;
    const marketCap =
      parseFloat(String(attrs.fdv_usd || attrs.market_cap_usd || "0")) || 0;
    const liquidity = parseFloat(String(attrs.reserve_in_usd || "0")) || 0;
    const volume24h =
      parseFloat(String((attrs.volume_usd as { h24?: string })?.h24 || attrs.h24_volume_usd || "0")) || 0;
    const priceChange24h =
      parseFloat(String((attrs.price_change_percentage as { h24?: string })?.h24 || "0")) || 0;
    let launchTime = new Date().toISOString();
    if (attrs.pool_created_at) {
      launchTime = new Date(String(attrs.pool_created_at)).toISOString();
    } else if (attrs.created_at) {
      launchTime = new Date(String(attrs.created_at)).toISOString();
    }
    const socials = extractSocials({ ...tokenAttrs, ...attrs });
    results.push({
      chainId,
      name: String(name).slice(0, 64),
      symbol: String(symbol).slice(0, 16).toUpperCase(),
      address,
      priceUsd,
      marketCap,
      liquidity,
      volume24h,
      priceChange24h,
      launchTime,
      logoUrl: (tokenAttrs.image_url as string) || undefined,
      socials,
      dataSource: "GeckoTerminal",
    });
  }
  return results;
}

export async function fetchAllNewPools(): Promise<RawPoolToken[]> {
  const chains: ChainId[] = ["solana", "ethereum", "base", "bsc"];
  const settled = await Promise.allSettled(
    chains.map((c) => fetchNewPoolsForChain(c, 1))
  );
  const all: RawPoolToken[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all;
}
