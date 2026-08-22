# ThisWeek.top - site plan (MVP)
Date: 22 Aug 2026
Working name: ThisWeek (domain: thisweek.top)
Pivot from forever-rank BumpBid to weekly board that resets every Monday 00:00 UTC.
Build: Next.js + Polar. No Razorpay. No categories. No forever rank.

## Product
Public USD weekly pay-to-rank board. Bid = rank for this week only. Listing = product URL or X @handle. Resets Monday 00:00 UTC.

## Locked rules
- weekId = Monday 00:00 UTC date (YYYY-MM-DD).
- On every board read, if stored weekId != current week, clear seats.
- Min bid $5. Take this weeks #1: week top + $5.
- Raise: same URL/@; pay difference; must beat own bid.
- Equal bids: older keeps higher seat.
- Polar webhook is truth for seat claim.

## Pages
/ board+countdown, /rules, /about, /success, /terms, /privacy

## Out of MVP
Categories, forever rank, auth, refunds UI, INR/Razorpay, agency branding, traffic claims.

## Visual (locked 22 Aug)
Match Outbid.lol: light cream + coral #e57255 + DM Sans. See OUTBID-RESTYLE.md. Not dark/mint/gold.
