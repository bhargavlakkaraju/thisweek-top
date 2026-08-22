# 111111.live — go live

Everything that can be automated is done and deployed. What is left needs *your*
accounts, because it needs credentials no agent can create on your behalf.

**Six actions. About 12 minutes total.** After each one, `/api/health` tells you
whether it worked — that endpoint is the scoreboard.

Live now: **https://111111-live.vercel.app**
Health:   **https://111111-live.vercel.app/api/health**

Right now health says `canTakeMoney: false`. Two of the six actions below flip it
to true. Nothing else on this list blocks a sale.

---

## 1. Blob storage — 60 seconds — **BLOCKS ALL REVENUE**

Without this a paid seat cannot be saved. Polar would take the money and the
board would stay empty, which is the worst possible failure.

Vercel → project `111111-live` → **Storage** → **Create Database** → **Blob** →
**Connect to Project**.

That injects `BLOB_READ_WRITE_TOKEN` automatically. Redeploy is triggered for you.

Verify: `blobWritable: true` in `/api/health`.

## 2. Polar payments — 5 minutes — **BLOCKS ALL REVENUE**

1. polar.sh → create an organisation.
2. Create **one product**. It must allow a **dynamic / pay-what-you-want amount**
   — checkout sends the band price in cents ($1 → 100, $111,111 → 11111100).
   A fixed-price product will reject every band except one.
3. Create a webhook → `https://111111.live/api/webhook/polar`
   (use the vercel.app URL until the domain is attached).
4. Vercel → Settings → Environment Variables, add:
   - `POLAR_ACCESS_TOKEN`
   - `POLAR_PRODUCT_ID`
   - `POLAR_WEBHOOK_SECRET`
   - `POLAR_SERVER` = `sandbox` first, then `production`
5. Redeploy.

Verify: `polarConfigured: true`, then `canTakeMoney: true`.

Test before announcing: buy one **$1** seat yourself in sandbox. It should appear
on the board within seconds with a 1-day expiry.

## 3. The domain — 3 minutes

I could not do this one: the Vercel MCP has no tool for attaching a domain you
already own, and there is no Vercel token in my environment.

1. Vercel → project → **Settings → Domains** → add `111111.live` **and**
   `www.111111.live`.
2. GoDaddy → DNS for `111111.live`. **Delete the parking/forwarding records for
   `@` and `www` first** — they will win otherwise. Then add:
   - `A` · `@` · `76.76.21.21`
   - `CNAME` · `www` · `cname.vercel-dns.com`

The certificate issues automatically once the A record resolves. The site already
emits `https://111111.live` in every canonical, sitemap and JSON-LD, so nothing
in the code needs changing.

## 4. Vercel Web Analytics — 20 seconds

`@vercel/analytics` and `@vercel/speed-insights` are already installed, deployed
and firing. They are simply not being recorded yet because the project toggle is
off.

Vercel → project → **Analytics** → **Enable**. No redeploy needed.

## 5. GA4 — 3 minutes

I could not create this: the Google Analytics tools available to me are
read-only reporting. Your account has properties for Bodhi Valley only — nothing
for this site.

1. analytics.google.com → Admin → **Create property** → name it `111111.live`.
2. Add a **Web data stream** for `https://111111.live`.
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
4. Vercel → Environment Variables → `NEXT_PUBLIC_GA_ID` = that ID → redeploy.

Verify: `ga4Configured: true`. Events already wired: `tier_selected`,
`begin_checkout`, `checkout_started`, `checkout_blocked`, `listing_click` — all
with `value` and `currency`, so GA4 reports revenue intent, not just pageviews.

## 6. DataFast — 2 minutes

Sign-up needs your account, so I could not do it.

1. https://datafa.st/dashboard/new → add site `111111.live`.
2. Copy the **Website ID** (starts `dfid_`).
3. Vercel → Environment Variables → `NEXT_PUBLIC_DATAFAST_ID` = that ID → redeploy.

The script tag, domain attribute and goal calls are already written. Setting the
variable is the whole installation.

---

## Also set while you are in there

- `ADMIN_SECRET` — a long random string. Unlocks `/admin`, and
  `POST /api/admin/clear`, which you need before the first real sale if any demo
  rows ever get seeded. (The board is currently empty and clean.)
- `CRON_SECRET` — a long random string. Stops anyone else triggering the nightly
  expiry sweep at `/api/cron/rollover`.

## Order that gets you paid fastest

1 → 2 → sandbox test → 4 → 3 → 5 → 6, then run the outreach in `X-OUTREACH.md`.

**Do not run the outreach before step 2 is verified.** Until then every "take a
seat" click returns *"Seats aren't open for purchase just yet"*, and sending the
Outbid crowd to that burns the one launch you get.
