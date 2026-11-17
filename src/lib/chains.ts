import { Chain, ChainId } from "@/types";

export const CHAINS: Record<ChainId, Chain> = {
  solana: {
    id: "solana",
    name: "Solana",
    shortName: "SOL",
    color: "#14F195",
    explorer: "https://solscan.io/token/",
    nativeSymbol: "SOL",
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    shortName: "ETH",
    color: "#627EEA",
    explorer: "https://etherscan.io/token/",
    nativeSymbol: "ETH",
  },
  base: {
    id: "base",
    name: "Base",
    shortName: "BASE",
    color: "#0052FF",
    explorer: "https://basescan.org/token/",
    nativeSymbol: "ETH",
  },
  bsc: {
    id: "bsc",
    name: "BNB Chain",
    shortName: "BNB",
    color: "#F0B90B",
    explorer: "https://bscscan.com/token/",
    nativeSymbol: "BNB",
  },
};

export const SUPPORTED_CHAINS: ChainId[] = ["solana", "ethereum", "base", "bsc"];

export function getChain(id: ChainId): Chain {
  return CHAINS[id];
}

export function getExplorerUrl(chainId: ChainId, address: string): string {
  return `${CHAINS[chainId].explorer}${address}`;
}
