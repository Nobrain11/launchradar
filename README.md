# LaunchRadar

Telegram-first crypto token launch discovery platform.

**Most important product rule:** A token without a valid public Telegram group or channel must never enter the public discovery feed.

## Features

- Multi-chain support: Solana, Ethereum, Base, BNB Chain
- **Telegram validation gate** — only tokens with valid public `t.me` / `telegram.me` links are listed
- Discovery feed with search, filters (chain, age, liquidity), and sorting
- Token detail pages with contract copy, explorer links, socials, risk indicators
- Watchlist (localStorage MVP; ready for Supabase Auth)
- Admin / data-source health dashboard
- Clearly labeled demo data when live APIs are not configured
- Dark premium UI inspired by professional crypto terminals

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- lucide-react icons
- Local storage for watchlist (MVP)
- Designed for Supabase (auth + DB) when you connect it

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` when moving to live data:

```env
# Optional — when integrating real providers
DEXSCREENER_API_KEY=
GECKOTERMINAL_API_KEY=

# Supabase (recommended for production auth + watchlists + persistence)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never commit secrets. Keep provider keys server-side only.

## Telegram Validation

See `src/lib/telegram.ts`:

- Accepts public group/channel links (`https://t.me/username`, `https://telegram.me/username`)
- Normalizes to canonical `https://t.me/...`
- Rejects empty, non-Telegram, private invite (`/+...`, `/joinchat/...`) links for the public feed
- Presence of a Telegram link is **never** treated as proof of legitimacy

## Database (planned)

Tables outlined in the product spec:

- `tokens`, `launches`, `social_links`, `chains`
- `watchlists`, `ingestion_runs`, `reported_links`

Unique constraint recommended on `(chain_id, contract_address)`.

Use Supabase migrations when you wire up the backend.

## Data Ingestion Notes

Adapters for DexScreener and GeckoTerminal should:

1. Fetch newly launched tokens
2. Normalize across chains
3. Deduplicate by chain + contract
4. Extract & validate Telegram links
5. **Exclude** any token that fails Telegram validation from the public feed
6. Cache responses, respect rate limits, log ingestion runs

Until credentials are present, the UI runs entirely on labeled demo records.

## Risk & Compliance

- Risk flags are always shown
- No token is described as “safe”
- Visible disclaimer: newly launched tokens are highly speculative; DYOR
- Report-bad-link action can be added against `reported_links`

## Project Structure

```
src/
  app/           # Routes (dashboard, launches, token/[id], watchlist, admin)
  components/    # UI building blocks
  lib/           # telegram validation, demo data, chains, utils
  types/         # Shared TypeScript types
```

## Acceptance Checklist

- [x] Dashboard shows four supported chains
- [x] Search & filters work
- [x] Feed only shows tokens with valid Telegram URLs
- [x] Tokens without Telegram are excluded
- [x] Token detail pages work
- [x] Contract addresses copyable
- [x] Watchlist works (localStorage)
- [x] Risk warnings visible
- [x] Data-source health page for admins
- [x] Demo data clearly distinguished
- [x] Responsive mobile + desktop

---

Built for rapid iteration. Connect real APIs and Supabase when ready for production traffic.
