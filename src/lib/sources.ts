import { Source } from "./types";

export const sources: Source[] = [
  // === Blockchain: Ethereum ===
  { name: "ethresear.ch", url: "https://ethresear.ch", feedUrl: "https://ethresear.ch/latest.rss", type: "rss", category: "blockchain", subcategory: "ethereum" },
  { name: "EIPs GitHub", url: "https://github.com/ethereum/EIPs", feedUrl: "https://github.com/ethereum/EIPs/commits/master.atom", type: "rss", category: "blockchain", subcategory: "ethereum" },
  { name: "EF Blog", url: "https://blog.ethereum.org", feedUrl: "https://blog.ethereum.org/feed.xml", type: "rss", category: "blockchain", subcategory: "ethereum" },

  // === Blockchain: Solana ===
  { name: "Solana News", url: "https://solana.com/news", feedUrl: "https://solana.com/news/rss.xml", type: "rss", category: "blockchain", subcategory: "solana" },

  // === Blockchain: Monad ===
  { name: "Monad Blog", url: "https://blog.monad.xyz", feedUrl: "https://blog.monad.xyz/feed.xml", type: "rss", category: "blockchain", subcategory: "monad" },

  // === Blockchain: Aptos ===
  { name: "Aptos Medium", url: "https://medium.com/aptoslabs", feedUrl: "https://medium.com/feed/aptoslabs", type: "rss", category: "blockchain", subcategory: "aptos" },

  // === Blockchain: Cosmos ===
  { name: "Cosmos Blog", url: "https://medium.com/the-interchain-foundation", feedUrl: "https://medium.com/feed/the-interchain-foundation", type: "rss", category: "blockchain", subcategory: "cosmos" },

  // === Blockchain: StarkNet ===
  { name: "StarkNet Community", url: "https://community.starknet.io", feedUrl: "https://community.starknet.io/latest.rss", type: "rss", category: "blockchain", subcategory: "starknet" },

  // === Blockchain: Arbitrum ===
  { name: "Offchain Labs", url: "https://medium.com/offchainlabs", feedUrl: "https://medium.com/feed/offchainlabs", type: "rss", category: "blockchain", subcategory: "arbitrum" },

  // === Blockchain: EigenLayer ===
  { name: "EigenCloud Blog", url: "https://blog.eigencloud.xyz", feedUrl: "https://blog.eigencloud.xyz/feed", type: "rss", category: "blockchain", subcategory: "eigenlayer" },

  // === Researchers: Ethereum & Consensus ===
  { name: "Vitalik Buterin", url: "https://vitalik.eth.limo", feedUrl: "https://vitalik.eth.limo/feed.xml", type: "rss", category: "blockchain", subcategory: "consensus-researchers" },
  { name: "Dankrad Feist", url: "https://dankradfeist.de", feedUrl: "https://dankradfeist.de/feed.xml", type: "rss", category: "blockchain", subcategory: "consensus-researchers" },
  { name: "Barnabé Monnot", url: "https://barnabe.substack.com", feedUrl: "https://barnabe.substack.com/feed", type: "rss", category: "blockchain", subcategory: "consensus-researchers" },
  { name: "Jon Charbonneau", url: "https://joncharbonneau.substack.com", feedUrl: "https://joncharbonneau.substack.com/feed", type: "rss", category: "blockchain", subcategory: "consensus-researchers" },

  // === Researchers: Yiling Chen (Harvard, prediction markets & mechanism design) ===
  { name: "Yiling Chen (arXiv)", url: "https://arxiv.org/search/?query=yiling+chen&searchtype=author", feedUrl: "https://arxiv.org/search/?query=au:yiling+chen&searchtype=author&abstracts=show&order=-announced_date_first&size=25", type: "scrape", category: "game-theory", subcategory: "math-decision" },

  // === Researchers: DeFi & MEV ===
  { name: "Hasu (Uncommon Core)", url: "https://uncommoncore.co", feedUrl: "https://uncommoncore.co/feed", type: "rss", category: "blockchain", subcategory: "defi-mev" },
  { name: "Flashbots Research", url: "https://writings.flashbots.net", feedUrl: "https://writings.flashbots.net/rss.xml", type: "rss", category: "blockchain", subcategory: "defi-mev" },

  // === AI / ML Labs ===
  { name: "OpenAI Blog", url: "https://openai.com/blog", feedUrl: "https://openai.com/blog/rss.xml", type: "rss", category: "ai-ml", subcategory: "ai-labs" },
  { name: "DeepMind Blog", url: "https://deepmind.google/blog", feedUrl: "https://deepmind.google/blog/rss.xml", type: "rss", category: "ai-ml", subcategory: "ai-labs" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog", feedUrl: "https://huggingface.co/blog/feed.xml", type: "rss", category: "ai-ml", subcategory: "ai-labs" },

  // === AI / ML Researchers ===
  { name: "Lilian Weng", url: "https://lilianweng.github.io", feedUrl: "https://lilianweng.github.io/index.xml", type: "rss", category: "ai-ml", subcategory: "ai-researchers" },
  { name: "Andrej Karpathy", url: "https://karpathy.github.io", feedUrl: "https://karpathy.github.io/feed.xml", type: "rss", category: "ai-ml", subcategory: "ai-researchers" },
  { name: "Import AI (Jack Clark)", url: "https://importai.substack.com", feedUrl: "https://importai.substack.com/feed", type: "rss", category: "ai-ml", subcategory: "ai-researchers" },

  // === Quantum & Cryptography ===
  { name: "Scott Aaronson", url: "https://scottaaronson.blog", feedUrl: "https://scottaaronson.blog/?feed=rss2", type: "rss", category: "quantum-crypto", subcategory: "quantum-researchers" },
  { name: "Matthew Green", url: "https://blog.cryptographyengineering.com", feedUrl: "https://blog.cryptographyengineering.com/feed", type: "rss", category: "quantum-crypto", subcategory: "quantum-researchers" },

  // === Game Theory & Math ===
  { name: "Terence Tao", url: "https://terrytao.wordpress.com", feedUrl: "https://terrytao.wordpress.com/feed", type: "rss", category: "game-theory", subcategory: "math-decision" },
  { name: "LessWrong", url: "https://www.lesswrong.com", feedUrl: "https://www.lesswrong.com/feed.xml", type: "rss", category: "game-theory", subcategory: "math-decision" },
  { name: "Quanta Magazine", url: "https://www.quantamagazine.org", feedUrl: "https://www.quantamagazine.org/feed", type: "rss", category: "game-theory", subcategory: "math-decision" },
  { name: "The Gradient", url: "https://thegradient.pub", feedUrl: "https://thegradient.pub/rss", type: "rss", category: "ai-ml", subcategory: "ai-researchers" },

  // === arXiv ===
  { name: "arXiv: Cryptography", url: "https://arxiv.org/list/cs.CR/recent", feedUrl: "https://arxiv.org/rss/cs.CR", type: "rss", category: "academic", subcategory: "arxiv" },
  { name: "arXiv: Game Theory", url: "https://arxiv.org/list/cs.GT/recent", feedUrl: "https://arxiv.org/rss/cs.GT", type: "rss", category: "academic", subcategory: "arxiv" },
  { name: "arXiv: AI", url: "https://arxiv.org/list/cs.AI/recent", feedUrl: "https://arxiv.org/rss/cs.AI", type: "rss", category: "academic", subcategory: "arxiv" },
  { name: "arXiv: Machine Learning", url: "https://arxiv.org/list/cs.LG/recent", feedUrl: "https://arxiv.org/rss/cs.LG", type: "rss", category: "academic", subcategory: "arxiv" },
  { name: "arXiv: Multi-Agent", url: "https://arxiv.org/list/cs.MA/recent", feedUrl: "https://arxiv.org/rss/cs.MA", type: "rss", category: "academic", subcategory: "arxiv" },
  { name: "arXiv: Quantum Physics", url: "https://arxiv.org/list/quant-ph/recent", feedUrl: "https://arxiv.org/rss/quant-ph", type: "rss", category: "academic", subcategory: "arxiv" },
];
