# Design — frederickcaseyhousand.com

A locked design system for this site. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

Direction (user brief, 2026-07-22): Apple-grade restraint · Inter · black and
white · Figma-community high taste · quiet precision.

## Genre
modern-minimal

## Macrostructure family
- Home + Consulting (marketing/thesis pages): **Marquee Hero opening + Long
  Document body** — the opening words fill the window (`--text-marquee`,
  ~10.5vw, left-aligned, vertically centred in ~86svh); the body is a single
  prose column with one full-bleed ink band as the page's only structural break.
- Portfolio: removed from this site 2026-07-22 — lives in the private
  `portfolio-private` repo, unlinked.

## Alignment — one left edge (amended 2026-07-22, valcasey.com reference)
Nothing is centered. All content — hero, section heads, body, footer — hangs
from the same left gutter (`--page-gutter`); the right side stays open. The
hero is top-anchored (not vertically centered) with whitespace below. After
the hero, body paragraphs sit in **two-column rows** (`.cols`, max 72rem,
collapse below 60rem): company prose, the claims list, the terms pair, the
bio paragraphs. Measure per column ≤ 60ch.

## Rules & dividers — NONE (amended 2026-07-22, user direction)
No hairline rules anywhere: no ruled claim lists, no footer top-border, no
project dividers. Separation is whitespace; hierarchy is scale and weight.
Type is the only ornament — "use the words like a paintbrush." Bold
(`<strong>`, weight 600) marks the load-bearing phrase inside paragraphs.
The only remaining hairlines are functional: the nav pill border and image
frames.

## Theme — custom
Vibe: "apple restraint, inter, black and white" · axes: light / geometric-sans / neutral

- `--color-paper`   oklch(100% 0 0)   — pure white (allowed: modern-minimal loosens gate 8)
- `--color-paper-2` oklch(96.7% 0 0)  — the grey band (Apple #f5f5f7 register)
- `--color-ink`     oklch(22% 0 0)    — near-black text (#1d1d1f register)
- `--color-ink-2`   oklch(37% 0 0)    — secondary text
- `--color-muted`   oklch(50% 0 0)    — de-emphasised text
- `--color-rule`    oklch(90% 0 0)    — hairline dividers
- `--color-rule-2`  oklch(94% 0 0)    — secondary dividers
- `--color-focus`   oklch(22% 0 0)    — focus ring = ink; on ink surfaces, paper

Accent: **neutral — the accent IS ink.** No chromatic accent anywhere. The only
"color" moves are black fills (primary CTA, the ink band) and grey steps.

## Typography
- Display: Inter Tight, weight 600, tracking −0.03em (display) / −0.02em (titles)
- Body:    Inter, weight 400 (500 for emphasis, 600 for strong)
- Outlier: Geist Mono 400 — footer line + meta/date lines ONLY (≤ 2 slots per page)
- Type scale anchor: `--text-display: clamp(2.5rem, 5vw + 0.5rem, 4.25rem)`
- Body size 17px (`1.0625rem`), line-height 1.6, measure 62ch

## Spacing
4-point named scale in `tokens.css` (`--space-3xs` … `--space-4xl`). Pages must
use named tokens, never raw values. Section padding is deliberately uneven —
the ink band gets the most air, the bio band the least.

## Motion
- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1) · `--ease-in` cubic-bezier(0.7, 0, 0.84, 0)
- Reveal pattern: **none.** The page is composed and still (Long Document is motion-off).
- Allowed motion: hover color shifts (120ms), button press translateY(1px), nothing else.
- Reduced-motion fallback: opacity-only, ≤ 150 ms.

## Microinteractions stance
- Silent success; no toasts, no scroll-triggered anything.
- Focus rings appear instantly, 2px, offset 3px, currentColor.
- Hover states are single-signal: one color shift OR one underline change, never both.

## CTA voice
- Primary CTA: ink-filled pill (`--radius-pill`), paper text, Inter 500,
  `padding: 0.75em 1.5em`, hover steps to `--color-ink-2`. One per page.
- Secondary CTA: typographic link — underline 1px, offset 3px, thickens on hover.
- Nav CTA: small ink-filled pill inside the floating pill nav.

## Chrome
- Nav: **N5 floating pill** — content-sized, top-centred, blur backdrop,
  hairline border, soft shadow. Wordmark + Work · Consulting · TinyMacro + CTA.
  Below 48rem: links collapse into a CSS-only `<details>` menu inside the pill.
- Footer: **Ft2 inline single line** — hairline rule above, one Geist Mono line,
  middot separators.

## Per-page allowances
- Home + Consulting MAY carry one full-bleed ink band (the structural break).
- Portfolio: typography + hairline rules only; screenshots inline at text
  measure inside `<figure>` with hairline borders — never re-drawn chrome.
- No enrichment anywhere. Typography carries the site.

## What pages MUST share
- The wordmark ("Fred Casey-Housand" in the pill, Inter Tight 600).
- The monochrome palette exactly as tokenised — no new colors, ever.
- Inter Tight + Inter + Geist Mono (2+1 ceiling).
- The CTA voice (pill shape, ink fill, single primary per page).
- The still-page motion stance.

## What pages MAY differ on
- Section rhythm and count within the Long Document family.
- Whether the ink band appears (content pages skip it).
- Ruled-list vs prose composition for the middle of the page.
