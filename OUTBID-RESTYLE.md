# ThisWeek.top restyle brief - match Outbid.lol
Date: 22 Aug 2026
Primary ref: https://outbid.lol
Secondary vibe: https://topapp.lol (clean restraint only - do NOT copy TopApp blue)
Tokens taken from live Outbid CSS (opened today). Not invented.

## Goal
Simple, lovely, clean. Look like Outbid. Drop dark inventiveness, drop mint, drop gold crown theme.

## Outbid design tokens (live)
Fonts:
- Sans: **DM Sans** (`--font-dm-sans`)
- Mono / tabular nums: **Geist Mono**

Core colors (from Outbid CSS frequency):
- Page bg / cream: `#f7f5f1` / `#f6f3ef` / `#fbfaf7`
- Surface white: `#fffdfa` / `#ffffff`
- Ink / foreground: `#282624` / `#231e1b` / `#1a1512`
- Muted text: `#77726d` / `#56514c` / `#67625d`
- Border / line: `#e6e0da` / soft brown-grey
- Primary accent (coral): `#e57255`  <- buttons, Claim #1, live emphasis
- Live green (online dot only): `#50c05f` / `#009f31` (tiny, not the brand)
- Black/white for contrast bits: `#000` / `#fff`

Outbid is a **light warm** product, not dark mode default. Dark mode toggle exists on Outbid - our MVP can ship light-first like Outbid's default.

TopApp vibe to borrow (not colors): lots of white space, thin lines, quiet hierarchy, no loud side cards. TopApp accent `#3b6ff5` - **do not use**.

## What to change on ThisWeek.top
1. **Kill dark near-black bg.** Use cream `#f7f5f1` page, white surfaces.
2. **Kill mint and gold accents.** Primary CTA and #1 price use Outbid coral `#e57255`.
3. **Type:** DM Sans everywhere UI; Geist Mono for bids, countdown, ranks (tabular-nums).
4. **Hero restraint:** Centered or simple left stack like Outbid - big "Claim #1 for $X", short subline, one primary button. Do not invent a heavy gold "Live this week" marketing card. A quiet current-top line is enough.
5. **Board density:** Compact rows, hairline borders `#e6e0da`, muted header labels, bid in mono, raise as quiet text button (not fat yellow pills).
6. **Buttons:** Filled coral primary, ghost/outline secondary. Small radius (Outbid is soft, not pill-stadium).
7. **Countdown:** Quiet banner, muted text, mono timer - not a neon purple strip.
8. **Honesty line:** Small muted text, not a yellow warning banner.
9. **Nav:** Wordmark left, text links, one small Claim #1 button right. Minimal.
10. **Keep product:** Monday UTC reset, weekly copy, Polar, min $5, top+$5 - only the skin changes.

## Severity gaps vs Outbid (current staging)
BLOCKER: CSS 404 - fix deploy first.
Then: dark theme, mint/gold inventiveness, loud cards, non-DM-Sans type, board not Outbid-dense.

## Done when
Hard refresh staging looks like a cousin of Outbid (cream + coral + DM Sans + compact board), CSS 200, Claim #1 works visually. Then Website Desk re-diffs and CoS can call Bhargav test-ready.
