import { Token, DataSourceStatus, DashboardStats, IngestionRun } from "@/types";
import { validateTelegramUrl } from "./telegram";

/**
 * Clearly labeled DEMO data. Never present as live market data.
 * All tokens here have validated public Telegram links.
 */

const now = Date.now();

function hoursAgo(h: number): string {
  return new Date(now - h * 3600 * 1000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(now - m * 60 * 1000).toISOString();
}

const rawTokens: Omit<Token, "telegramValidated" | "telegramNormalized" | "riskFlags">[] = [
  {
    id: "sol-1",
    name: "Radar Pup",
    symbol: "RPUP",
    chainId: "solana",
    contractAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    logoUrl: undefined,
    launchTime: minutesAgo(45),
    marketCap: 285000,
    liquidity: 42000,
    volume24h: 89000,
    priceChange24h: 34.2,
    priceUsd: 0.000285,
    socials: {
      telegram: "https://t.me/radarpupofficial",
      twitter: "https://x.com/radarpup",
      website: "https://radarpup.example",
    },
    dataSource: "DexScreener (demo)",
    lastUpdated: minutesAgo(2),
    isDemo: true,
  },
  {
    id: "eth-1",
    name: "Green Circuit",
    symbol: "GCIR",
    chainId: "ethereum",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    launchTime: hoursAgo(3),
    marketCap: 1200000,
    liquidity: 185000,
    volume24h: 340000,
    priceChange24h: -8.4,
    priceUsd: 0.012,
    socials: {
      telegram: "https://t.me/greencircuit",
      twitter: "https://x.com/greencircuit",
      discord: "https://discord.gg/greencircuit",
    },
    dataSource: "GeckoTerminal (demo)",
    lastUpdated: minutesAgo(5),
    isDemo: true,
  },
  {
    id: "base-1",
    name: "Base Layer AI",
    symbol: "BLAI",
    chainId: "base",
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    launchTime: hoursAgo(8),
    marketCap: 560000,
    liquidity: 72000,
    volume24h: 125000,
    priceChange24h: 12.7,
    priceUsd: 0.0056,
    socials: {
      telegram: "https://telegram.me/baselayerai",
      website: "https://baselayerai.example",
    },
    dataSource: "DexScreener (demo)",
    lastUpdated: minutesAgo(8),
    isDemo: true,
  },
  {
    id: "bsc-1",
    name: "BNB Pulse",
    symbol: "BNBP",
    chainId: "bsc",
    contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
    launchTime: hoursAgo(14),
    marketCap: 98000,
    liquidity: 18500,
    volume24h: 42000,
    priceChange24h: 67.3,
    priceUsd: 0.000098,
    socials: {
      telegram: "https://t.me/bnbpulse",
      twitter: "https://x.com/bnbpulse",
    },
    dataSource: "GeckoTerminal (demo)",
    lastUpdated: minutesAgo(12),
    isDemo: true,
  },
  {
    id: "sol-2",
    name: "Meme Architect",
    symbol: "MARCH",
    chainId: "solana",
    contractAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    launchTime: hoursAgo(1.5),
    marketCap: 450000,
    liquidity: 68000,
    volume24h: 210000,
    priceChange24h: 22.1,
    priceUsd: 0.00045,
    socials: {
      telegram: "https://t.me/memearchitect",
      twitter: "https://x.com/memearchitect",
      website: "https://memearchitect.example",
      discord: "https://discord.gg/march",
    },
    dataSource: "DexScreener (demo)",
    lastUpdated: minutesAgo(1),
    isDemo: true,
  },
  {
    id: "eth-2",
    name: "Launch Signal",
    symbol: "LSIG",
    chainId: "ethereum",
    contractAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    launchTime: hoursAgo(22),
    marketCap: 2100000,
    liquidity: 310000,
    volume24h: 780000,
    priceChange24h: -3.2,
    priceUsd: 0.021,
    socials: {
      telegram: "https://t.me/launchsignal",
      twitter: "https://x.com/launchsignal",
    },
    dataSource: "GeckoTerminal (demo)",
    lastUpdated: minutesAgo(15),
    isDemo: true,
  },
  {
    id: "base-2",
    name: "Onchain Radar",
    symbol: "ORAD",
    chainId: "base",
    contractAddress: "0x1111222233334444555566667777888899990000",
    launchTime: hoursAgo(5),
    marketCap: 175000,
    liquidity: 28000,
    volume24h: 56000,
    priceChange24h: 45.8,
    priceUsd: 0.00175,
    socials: {
      telegram: "https://t.me/onchainradar",
      website: "https://onchainradar.example",
    },
    dataSource: "DexScreener (demo)",
    lastUpdated: minutesAgo(4),
    isDemo: true,
  },
  {
    id: "sol-3",
    name: "Pump Sentinel",
    symbol: "PSENT",
    chainId: "solana",
    contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    launchTime: minutesAgo(20),
    marketCap: 89000,
    liquidity: 12500,
    volume24h: 34000,
    priceChange24h: 112.5,
    priceUsd: 0.000089,
    socials: {
      telegram: "https://t.me/pumpsentinel",
      twitter: "https://x.com/pumpsentinel",
    },
    dataSource: "DexScreener (demo)",
    lastUpdated: minutesAgo(1),
    isDemo: true,
  },
];

function buildRiskFlags(token: typeof rawTokens[0]): Token["riskFlags"] {
  const flags: Token["riskFlags"] = [];

  flags.push({
    type: "new_token",
    label: "Newly launched",
    severity: "medium",
  });

  if (token.liquidity < 30000) {
    flags.push({
      type: "low_liquidity",
      label: "Low liquidity",
      severity: "high",
    });
  }

  if (!token.socials.twitter && !token.socials.website) {
    flags.push({
      type: "missing_verification",
      label: "Limited external links",
      severity: "medium",
    });
  }

  flags.push({
    type: "unverified",
    label: "Unverified token",
    severity: "medium",
  });

  return flags;
}

export const DEMO_TOKENS: Token[] = rawTokens
  .map((t) => {
    const validation = validateTelegramUrl(t.socials.telegram);
    if (!validation.valid) {
      return null;
    }
    return {
      ...t,
      telegramValidated: true,
      telegramNormalized: validation.normalized,
      riskFlags: buildRiskFlags(t),
    };
  })
  .filter((t): t is Token => t !== null);

export const REJECTED_DEMO_COUNT = 14;

export const DEMO_STATS: DashboardStats = {
  totalLaunches: DEMO_TOKENS.length + REJECTED_DEMO_COUNT,
  withTelegram: DEMO_TOKENS.length,
  chainsRepresented: 4,
  lastSync: minutesAgo(1),
  isDemoData: true,
};

export const DEMO_DATA_SOURCES: DataSourceStatus[] = [
  {
    provider: "DexScreener",
    connected: false,
    lastSync: minutesAgo(1),
    tokensFetched: 18,
    tokensRejectedNoTelegram: 9,
    invalidLinks: 2,
    errors: 0,
    isDemo: true,
  },
  {
    provider: "GeckoTerminal",
    connected: false,
    lastSync: minutesAgo(3),
    tokensFetched: 12,
    tokensRejectedNoTelegram: 5,
    invalidLinks: 1,
    errors: 0,
    isDemo: true,
  },
];

export const DEMO_INGESTION_RUNS: IngestionRun[] = [
  {
    id: "run-1",
    provider: "DexScreener",
    startedAt: minutesAgo(5),
    finishedAt: minutesAgo(1),
    status: "success",
    tokensFetched: 18,
    tokensAccepted: 9,
    tokensRejectedNoTelegram: 9,
    invalidTelegramLinks: 2,
    errors: [],
  },
  {
    id: "run-2",
    provider: "GeckoTerminal",
    startedAt: minutesAgo(8),
    finishedAt: minutesAgo(3),
    status: "success",
    tokensFetched: 12,
    tokensAccepted: 7,
    tokensRejectedNoTelegram: 5,
    invalidTelegramLinks: 1,
    errors: [],
  },
];

export function getTokenById(id: string): Token | undefined {
  return DEMO_TOKENS.find((t) => t.id === id);
}

export function searchTokens(
  query: string,
  filters: {
    chain?: string;
    minLiquidity?: number;
    maxAgeHours?: number;
    minMarketCap?: number;
  } = {},
  sort: "newest" | "liquidity" | "volume" | "mcap" = "newest"
): Token[] {
  let results = [...DEMO_TOKENS];

  results = results.filter((t) => t.telegramValidated);

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.contractAddress.toLowerCase().includes(q)
    );
  }

  if (filters.chain && filters.chain !== "all") {
    results = results.filter((t) => t.chainId === filters.chain);
  }

  if (filters.minLiquidity !== undefined) {
    results = results.filter((t) => t.liquidity >= filters.minLiquidity!);
  }

  if (filters.minMarketCap !== undefined) {
    results = results.filter((t) => t.marketCap >= filters.minMarketCap!);
  }

  if (filters.maxAgeHours !== undefined) {
    const cutoff = Date.now() - filters.maxAgeHours * 3600 * 1000;
    results = results.filter((t) => new Date(t.launchTime).getTime() >= cutoff);
  }

  switch (sort) {
    case "newest":
      results.sort((a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime());
      break;
    case "liquidity":
      results.sort((a, b) => b.liquidity - a.liquidity);
      break;
    case "volume":
      results.sort((a, b) => b.volume24h - a.volume24h);
      break;
    case "mcap":
      results.sort((a, b) => b.marketCap - a.marketCap);
      break;
  }

  return results;
}
