# 111111.live

A paid placement board priced in ones. The domain is the price list.

| Band | Seats | Term |
|------|-------|------|
| $1 | unlimited | 1 day |
| $11 | 1,111 | 1 week |
| $111 | 111 | 1 month |
| $1,111 | 11 | 1 quarter |
| $11,111 | 3 | 1 year |
| $111,111 | 1 | permanent |

Rank is band first, then first-paid-first-placed inside the band. There is no
auction: a paid seat cannot be displaced before its term ends.

## Why seats expire instead of the board resetting

A weekly wipe destroys every URL the site produces. Finite seats with no expiry
sell out once and then have nothing left to sell. So each seat carries its own
term — inventory regenerates continuously, and the record survives.

The week survives as the **archive key**, not a kill switch:

- `/week/{YYYY-MM-DD}` — a week frozen at a permanent URL
- `/weeks` — the archive index
- `/listing/{listingKey}` — one listing's history across every week it appeared
- `/stats` + `/api/board` — public, countable numbers
- `/llms.txt` — machine-readable summary for answer engines

## Stack

Next.js 15 (App Router) · Vercel Blob for board state · Polar for checkout.

## Local

```bash
npm install
cp .env.example .env.local   # fill in Polar + blob token
npm run dev
```

## Operations

- `POST /api/admin/clear` (with `ADMIN_SECRET`) — remove every row. Run this once
  before the first real sale to clear seeded demo data.
- `POST /api/admin/seed` — demo rows, all flagged `demo:true`. Never on production.
- `/api/cron/rollover` — nightly at 02:00 UTC: sweeps expired seats and writes the
  weekly snapshots. Configured in `vercel.json`.

## House rules for this codebase

- **Never invent a number.** Click counts are measured through `/api/click/[id]`.
  There is no visitor ticker, because we would have to make it up.
- Outbound listing links carry `rel="sponsored"`.
- Copy is our own. Do not paste in wording from other boards.
