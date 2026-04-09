# Excerpta

A research aggregation platform that collects, organizes, and surfaces cutting-edge content from 50+ specialized sources across blockchain, AI/ML, game theory, quantum computing, and academia.

Built with Next.js 16, React 19, and deployed on Vercel.

## What It Does

Excerpta automatically ingests articles from diverse sources using 9 different fetching strategies, caches them efficiently, and presents them through a clean, searchable interface with category browsing and personal curation tools.

### Knowledge Categories

| Category | Sources | Examples |
|----------|---------|----------|
| **Blockchain** | 16 | ethresear.ch, EIPs, Vitalik, Dankrad Feist, Flashbots, EigenCloud |
| **AI / ML** | 7 | OpenAI, DeepMind, Hugging Face, Lilian Weng, Andrej Karpathy |
| **Game Theory & Math** | 3 | Terence Tao, LessWrong, Quanta Magazine |
| **Quantum & Cryptography** | 2 | Scott Aaronson, Matthew Green |
| **Academic (arXiv)** | 6 | cs.CR, cs.GT, cs.AI, cs.LG, cs.MA, quant-ph |

### Fetching Strategies

- **RSS/Atom** - Standard feed parsing (rss-parser)
- **Discourse API** - Paginated forum topics (ethresear.ch, StarkNet)
- **GitHub API** - Repository contents (EIPs)
- **Substack Archive API** - Full newsletter archives
- **WordPress REST API** - Paginated blog posts
- **arXiv API** - Academic papers with date-range filtering (last 30 days, up to 2000/category)
- **LessWrong GraphQL** - Rationality and alignment posts
- **Sitemap Parsing** - Full article archives from XML sitemaps
- **Medium RSS** - Publication feeds

## Features

- **Category & Subcategory Browsing** - Filter by ecosystem, research area, or source type
- **Full-Text Search** - Search across titles, sources, excerpts, and authors
- **Bookmarks & Read Tracking** - Local persistence via localStorage
- **Article Reader** - In-app content extraction with clean reading view
- **Custom Summaries & Tags** - Personal notes and tagging per article
- **Dark/Light Theme** - System-aware with manual toggle
- **3D Hero Visualization** - Interactive floating node network (Three.js / React Three Fiber)
- **Automated Daily Refresh** - Vercel Cron at 08:00 UTC

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| 3D Graphics | Three.js, @react-three/fiber, @react-three/drei |
| Data Fetching | rss-parser, native fetch, custom XML/GraphQL parsers |
| Caching | Vercel Blob (production), local JSON (development) |
| Scheduling | Vercel Cron |
| Language | TypeScript 5 |

## Project Structure

```
src/
  app/
    page.tsx                  # Home - category previews + 3D hero
    layout.tsx                # Root layout
    globals.css               # Theme variables + Tailwind
    category/[slug]/          # Category detail with search & filters
    article/[id]/             # Article reader view
    bookmarks/                # Saved articles
    author/[name]/            # Filter by author/source
    api/
      articles/route.ts       # Main data endpoint (fetch + cache)
      preview/route.ts        # Lightweight home page data
      cron/refresh/route.ts   # Scheduled refresh trigger
      content/route.ts        # Article content extraction
      summary/route.ts        # Save custom summaries
      tags/route.ts           # Save custom tags
  components/
    Navbar.tsx                # Navigation + theme toggle + search
    ArticleCard.tsx           # Reusable article card
    HeroScene.tsx             # 3D background visualization
    SubcategoryFilter.tsx     # Subcategory filter buttons
    Hero.tsx                  # Static hero fallback
    Footer.tsx                # Footer
  lib/
    fetchers.ts               # 9 fetching strategies
    sources.ts                # Source definitions (34+ entries)
    cache.ts                  # Dual-layer cache (Blob + local)
    types.ts                  # TypeScript interfaces
    useLocalStorage.ts        # Client storage hook
    useTheme.ts               # Theme toggle hook
  data/
    articles-cache.json       # Local dev cache
    preview-cache.json        # Home page cache
    summaries.json            # User summaries
    tags.json                 # User tags
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Muhammed5500/Excerpta.git
cd Excerpta
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Required for production (Vercel Blob storage)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Required for cron refresh endpoint
CRON_SECRET=your_cron_secret

# Auto-set by Vercel, manual for local
VERCEL_URL=localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To trigger a manual data refresh:

```
GET /api/articles?refresh=true
```

### Production

Deployed on Vercel with automatic daily refresh via cron job at 08:00 UTC.

```bash
npm run build
npm start
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/articles` | All articles (supports `?category=`, `?subcategory=`, `?refresh=true`) |
| GET | `/api/preview` | Home page preview (3 articles per category) |
| GET | `/api/cron/refresh` | Cron-triggered refresh (requires `Authorization: Bearer <CRON_SECRET>`) |
| GET | `/api/content?url=` | Extract article content from URL |
| POST | `/api/summary` | Save article summary |
| POST | `/api/tags` | Save article tags |

## Data Flow

```
Sources (50+)
  --> Fetchers (RSS, API, GraphQL, Sitemap, Scrape)
    --> Deduplication (title-based)
      --> Cache (Vercel Blob / local JSON)
        --> API Routes
          --> React Components
            --> Client Storage (bookmarks, read state, theme)
```

## License

MIT
