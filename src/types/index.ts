export type ChainId = "solana" | "ethereum" | "base" | "bsc";

export interface Chain {
  id: ChainId;
  name: string;
  shortName: string;
  color: string;
  explorer: string;
  nativeSymbol: string;
}

export interface SocialLinks {
  telegram?: string;
  twitter?: string;
  website?: string;
  discord?: string;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskFlag {
  type: "unverified" | "low_liquidity" | "suspicious_social" | "missing_verification" | "new_token";
  label: string;
  severity: RiskLevel;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  chainId: ChainId;
  contractAddress: string;
  logoUrl?: string;
  launchTime: string; // ISO
  marketCap: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
  priceUsd: number;
  socials: SocialLinks;
  telegramValidated: boolean;
  telegramNormalized?: string;
  riskFlags: RiskFlag[];
  dataSource: string;
  lastUpdated: string;
  isDemo?: boolean;
}

export interface WatchlistItem {
  tokenId: string;
  addedAt: string;
}

export interface IngestionRun {
  id: string;
  provider: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "success" | "error" | "partial";
  tokensFetched: number;
  tokensAccepted: number;
  tokensRejectedNoTelegram: number;
  invalidTelegramLinks: number;
  errors: string[];
}

export interface DataSourceStatus {
  provider: string;
  connected: boolean;
  lastSync?: string;
  tokensFetched: number;
  tokensRejectedNoTelegram: number;
  invalidLinks: number;
  errors: number;
  isDemo: boolean;
}

export interface DashboardStats {
  totalLaunches: number;
  withTelegram: number;
  chainsRepresented: number;
  lastSync: string;
  isDemoData: boolean;
}
