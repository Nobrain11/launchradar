/**
 * LaunchRadar ingestion orchestrator.
 * Fetches from GeckoTerminal + DexScreener, enforces Telegram gate,
 * normalizes to Token[], falls back to demo data when live sources
 * yield nothing usable.
 */

import { Token, RiskFlag, DashboardStats, DataSourceStatus } from "@/types";
import { validateTelegramUrl } from "@/lib/telegram";
import { DEMO_TOKENS, DEMO_STATS, DEMO_DATA_SOURCES } from "@/lib/demo-data";
import { fetchAllNewPools, RawPoolToken } from "./geckoterminal";
import {
  fetchLatestTokenProfiles,
  enrichWithPairData,
  DsRawToken,
} from "./dexscreener";

export interface IngestionResult {
  tokens: Token[];
  stats: DashboardStats;
  sources: DataSourceStatus[];
  isLive: boolean;
  fetchedAt: string;
  rejectedNoTelegram: number;
}

function buildRiskFlags(t: {
  liquidity: number;
  socials: { twitter?: string; website?: string };
}): RiskFlag[] {
  const flags: RiskFlag[] = [
    { type: "new_token", label: "Newly launched", severity: "medium" },
    { type: "unverified", label: "Unverified token", severity: "medium" },
  ];
  if (t.liquidity < 30000) {
    flags.push({
      type: "low_liquidity",
      label: "Low liquidity",
      severity: "high",
    });
  }
  if (!t.socials.twitter && !t.socials.website) {
    flags.push({
      type: "missing_verification",
      label: "Limited external links",
      severity: "medium",
    });
  }
  return flags;
}

function toToken(
  raw: RawPoolToken | DsRawToken,
  idPrefix: string
): Token | null {
  const validation = validateTelegramUrl(raw.socials.telegram);
  if (!validation.valid || !validation.normalized) return null;

  return {
    id: `${idPrefix}-${raw.chainId}-${raw.address.slice(0, 12)}`,
    name: raw.name,
    symbol: raw.symbol,
    chainId: raw.chainId,
    contractAddress: raw.address,
    logoUrl: raw.logoUrl,
    launchTime: raw.launchTime,
    marketCap: raw.marketCap,
    liquidity: raw.liquidity,
    volume24h: raw.volume24h,
    priceChange24h: raw.priceChange24h,
    priceUsd: raw.priceUsd,
    socials: {
      telegram: validation.normalized,
      twitter: raw.socials.twitter,
      website: raw.socials.website,
      discord: raw.socials.discord,
    },
    telegramValidated: true,
    telegramNormalized: validation.normalized,
    riskFlags: buildRiskFlags(raw),
    dataSource: raw.dataSource,
    lastUpdated: new Date().toISOString(),
    isDemo: false,
  };
}

export async function ingestTokens(): Promise<IngestionResult> {
  const fetchedAt = new Date().toISOString();
  let rejectedNoTelegram = 0;
  const accepted: Token[] = [];
  const seen = new Set<string>();
  const sources: DataSourceStatus[] = [];

  let gtFetched = 0;
  let gtAccepted = 0;
  let gtRejected = 0;
  try {
    const pools = await fetchAllNewPools();
    gtFetched = pools.length;
    for (const p of pools) {
      const key = `${p.chainId}:${p.address.toLowerCase()}`;
      if (seen.has(key)) continue;
      const token = toToken(p, "gt");
      if (token) {
        seen.add(key);
        accepted.push(token);
        gtAccepted++;
      } else {
        gtRejected++;
        rejectedNoTelegram++;
      }
    }
    sources.push({
      provider: "GeckoTerminal",
      connected: true,
      lastSync: fetchedAt,
      tokensFetched: gtFetched,
      tokensRejectedNoTelegram: gtRejected,
      invalidLinks: 0,
      errors: 0,
      isDemo: false,
    });
  } catch {
    sources.push({
      provider: "GeckoTerminal",
      connected: false,
      lastSync: fetchedAt,
      tokensFetched: 0,
      tokensRejectedNoTelegram: 0,
      invalidLinks: 0,
      errors: 1,
      isDemo: false,
    });
  }

  let dsFetched = 0;
  let dsAccepted = 0;
  let dsRejected = 0;
  try {
    const profiles = await fetchLatestTokenProfiles();
    dsFetched = profiles.length;
    const toEnrich = profiles.slice(0, 12);
    await Promise.allSettled(
      toEnrich.map(async (p) => {
        const extra = await enrichWithPairData(p.chainId, p.address);
        if (extra) {
          if (extra.name) p.name = extra.name;
          if (extra.symbol) p.symbol = extra.symbol;
          if (extra.priceUsd) p.priceUsd = extra.priceUsd;
          if (extra.marketCap) p.marketCap = extra.marketCap;
          if (extra.liquidity) p.liquidity = extra.liquidity;
          if (extra.volume24h) p.volume24h = extra.volume24h;
          if (extra.priceChange24h) p.priceChange24h = extra.priceChange24h;
          if (extra.launchTime) p.launchTime = extra.launchTime;
        }
      })
    );
    for (const p of profiles) {
      const key = `${p.chainId}:${p.address.toLowerCase()}`;
      if (seen.has(key)) continue;
      const token = toToken(p, "ds");
      if (token) {
        seen.add(key);
        accepted.push(token);
        dsAccepted++;
      } else {
        dsRejected++;
        rejectedNoTelegram++;
      }
    }
    sources.push({
      provider: "DexScreener",
      connected: true,
      lastSync: fetchedAt,
      tokensFetched: dsFetched,
      tokensRejectedNoTelegram: dsRejected,
      invalidLinks: 0,
      errors: 0,
      isDemo: false,
    });
  } catch {
    sources.push({
      provider: "DexScreener",
      connected: false,
      lastSync: fetchedAt,
      tokensFetched: 0,
      tokensRejectedNoTelegram: 0,
      invalidLinks: 0,
      errors: 1,
      isDemo: false,
    });
  }

  accepted.sort(
    (a, b) =>
      new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime()
  );

  if (accepted.length > 0) {
    const chains = new Set(accepted.map((t) => t.chainId));
    return {
      tokens: accepted,
      stats: {
        totalLaunches: accepted.length + rejectedNoTelegram,
        withTelegram: accepted.length,
        chainsRepresented: chains.size,
        lastSync: fetchedAt,
        isDemoData: false,
      },
      sources,
      isLive: true,
      fetchedAt,
      rejectedNoTelegram,
    };
  }

  return {
    tokens: DEMO_TOKENS,
    stats: { ...DEMO_STATS, lastSync: fetchedAt },
    sources: DEMO_DATA_SOURCES.map((s) => ({ ...s, lastSync: fetchedAt })),
    isLive: false,
    fetchedAt,
    rejectedNoTelegram: DEMO_STATS.totalLaunches - DEMO_STATS.withTelegram,
  };
}

let cache: { result: IngestionResult; expires: number } | null = null;
const CACHE_TTL_MS = 45_000;

export async function getTokensCached(): Promise<IngestionResult> {
  const now = Date.now();
  if (cache && cache.expires > now) return cache.result;
  const result = await ingestTokens();
  cache = { result, expires: now + CACHE_TTL_MS };
  return result;
}
