# ThisWeek.top UI v1.1 - converting board (Outbid-dense)
Date: 22 Aug 2026
Refs: https://outbid.lol live board · ours https://thisweek-ship.vercel.app
Weekly Monday 00:00 UTC reset STAYS. NO 28 categories. NO category pass this round.

## Problem
Current board is a thin table. Bhargav: not converting vs Outbid. Outbid feels like a product feed you want to claim into.

## Lock (v1.1)
1. Replace table with **Outbid-style listing cards**
2. Sticky top **Claim #1** with **+/- dollar control** (live next price = current #1 + $5, or $5 if empty)
3. **Latest activity** feed (last 8 bids)
4. Optional soft **visitor counter** stub
5. Claim form: **description required**, max **140 chars**
6. Categories: NOT now. Maybe 5 tags in v1.5.

## Listing card anatomy (target)
Horizontal dense card, cream surface, hairline border `#e6e0da`, coral CTAs.

Left → right (wrap on mobile):
- **Rank** - mono number (#1 larger / coral emphasis)
- **Favicon** - 28-32px rounded from domain (or logo URL)
- **Identity stack**
  - Name (semibold)
  - Domain or @handle (muted, mono-ish)
  - One-line **description** (muted, clamp 1-2 lines, from 140-char field)
- **Bid** - big mono `$120` right-weighted
- **Meta** - `2h ago` · optional `clicks` stub
- **CTA** - `Claim this rank` / `Raise` coral button (next price for that seat)

Empty week: keep card list chrome + one empty state card, not a lonely table.

## Sticky Claim #1 bar
Sticky under header (or fused into header on scroll):
- Label: Claim #1
- Display live price: `$X` where X = weekTop + 5 (min 5)
- **− / +** steppers ($1 steps, floor max(5, weekTop+5) for #1 path; allow higher)
- Primary button: `Claim #1 for $X`
- Quiet: `Resets Monday 00:00 UTC · Nd Nh Nm`

## Latest activity
Right rail or below board (Outbid energy):
- Last 8 events: `{name} bid $Y · Zh ago` or `took #N`
- Soft, not a second product

## Visitor counter (stub)
Optional soft line: `1,204 visitors this week` (static stub ok until real analytics)

## Schema (Digital Product)
| Field | Type | Notes |
|-------|------|-------|
| name | string | display name |
| listing | string | URL or @handle |
| logoUrl | string? | optional; else favicon from domain |
| description | string | **required**, max 140 |
| bidUsd | int | whole dollars, min 5 |
| createdAt | datetime | time ago |
| clicks | int? | stub 0 ok |
| weekId | string | Monday UTC week key |

Claim/Raise API unchanged except require description on create.

## Claim form adds
- Description textarea, required, counter `0/140`
- Keep name, listing, logo optional, bid

## Out of v1.1
Categories / 28 tags, real click tracking, forever rank, dark theme, mint/gold inventiveness.

## Visual tokens (unchanged)
Cream `#f7f5f1`, ink `#282624`, coral `#e57255`, line `#e6e0da`, DM Sans + Geist Mono. Soft radius `0.625rem`.

## Acceptance
- Board feels like Outbid density (cards, not spreadsheet)
- Sticky Claim #1 +/- works visually
- Activity feed visible
- Description on every seeded/mock card
- Weekly reset copy still present
- Screenshot-friendly at 1440 wide

## v1.1b - denser / closer to live Outbid (22 Aug evening)
Bhargav: loves how Outbid shows everything. First v1.1 mock was too agency/spacious.

Live Outbid refs: /workspace/thisweek/outbid-live/outbid-hero.png + outbid-board.png
Mock SoT: /workspace/thisweek/html/board-v11.html

### Layout lock (match Outbid, skip categories)
1. Centered hero: "Claim #1 for" + inline − $PRICE + steppers (big coral price). Not a sticky bar.
2. Inline claim strip under hero: URL/@ + coral primary button. Soft raise note. Description can sit in expanded claim / lower form (required 140).
3. Soft online/visitors pill near top. Weekly reset countdown quiet (ThisWeek only).
4. Top 3 = large featured cards (rounded-2xl). #1/#2 soft coral tint + coral border. Circular rank badge + circular favicon. Name left, BIG CORAL $ right. 2-line description. Footer: time ago · clicks. Text link: "claim this rank for $X".
5. Latest activity = horizontal pills BETWEEN #3 and #4 (not right sidebar).
6. #4+ denser list rows with hairline dividers. Same claim link. Not big white cards.
7. NO category pills this pass.

### Schema unchanged
description required max 140, clicks stub, favicon/logoUrl, bidUsd, createdAt, weekId.
