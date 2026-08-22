# ThisWeek.top - Polar setup checklist
Date: 22 Aug 2026

Never paste tokens into chat. Wire secrets on the box / Vercel env only.

## Env vars (app)
- NEXT_PUBLIC_APP_URL = https://<claimed-host or thisweek.top>
- POLAR_SERVER = sandbox first, then production
- POLAR_ACCESS_TOKEN = org access token (sandbox org vs prod org)
- POLAR_PRODUCT_ID = product that allows custom / pay-what-you-want amount (cents)
- POLAR_WEBHOOK_SECRET = webhook signing secret
- ADMIN_SECRET = for /admin seed only

## Sandbox vs prod
1. Start sandbox. Create sandbox org + product + webhook.
2. Set POLAR_SERVER=sandbox and sandbox token/product/secret on Vercel.
3. Test one $5 claim end-to-end (checkout -> webhook -> board seat).
4. Flip to production: new prod token/product/webhook, POLAR_SERVER=production, same paths.

## Product
- One product. Must allow dynamic amount (checkout sends `amount` in cents).
- Name e.g. "ThisWeek.top seat" - price is set per checkout, not fixed $5 only.
- Currency USD.

## Webhook
- URL: https://<APP_HOST>/api/webhook/polar
- Events needed: order paid / checkout succeeded (app listens via @polar-sh/nextjs Webhooks).
- Copy signing secret into POLAR_WEBHOOK_SECRET on Vercel (not chat).

## Success URL
- Polar checkout uses: {NEXT_PUBLIC_APP_URL}/success?checkout_id={CHECKOUT_ID}
- Seat truth is webhook, not the success page alone.

## When Bhargav says ready
1. Open Polar on the shared box browser (he signs in if needed).
2. Create/select product (dynamic amount).
3. Create webhook pointing at /api/webhook/polar.
4. Set Vercel project env vars from the box (or polar dashboard + vercel env UI).
5. Redeploy. Smoke-test $5 sandbox claim.
