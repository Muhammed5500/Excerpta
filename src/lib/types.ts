export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceUrl: string;
  category: Category;
  subcategory: string;
  date: string;
  excerpt: string;
  summary?: string;
  author?: string;
}

export type Category =
  | "blockchain"
  | "ai-ml"
  | "game-theory"
  | "quantum-crypto"
  | "academic";

export interface Source {
  name: string;
  url: string;
  feedUrl: string;
  type: "rss" | "github" | "api" | "scrape";
  category: Category;
  subcategory: string;
}

export interface Summary {
  articleId: string;
  content: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  blockchain: "Blockchain",
  "ai-ml": "AI / ML",
  "game-theory": "Game Theory & Math",
  "quantum-crypto": "Quantum & Cryptography",
  academic: "Academic",
};

export const SUBCATEGORY_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  solana: "Solana",
  avalanche: "Avalanche",
  monad: "Monad",
  sui: "Sui",
  aptos: "Aptos",
  cosmos: "Cosmos",
  starknet: "StarkNet",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  zksync: "zkSync",
  eigenlayer: "EigenLayer",
  "ai-labs": "AI Labs",
  "ai-researchers": "AI Researchers",
  "consensus-researchers": "Consensus Researchers",
  "defi-mev": "DeFi & MEV",
  "quantum-researchers": "Quantum & Crypto",
  "math-decision": "Math & Decision Theory",
  arxiv: "arXiv",
  "vc-research": "VC Research",
};
