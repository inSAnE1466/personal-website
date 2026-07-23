# frederickcaseyhousand.com

Personal site. No frameworks, no build step — HTML and CSS.

## Structure

```
index.html        # home — founder thesis + TinyMacro
consulting.html   # consulting page
tokens.css        # design tokens (colors, type, spacing, motion)
home.css          # page styles (both pages)
design.md         # the locked design system — read before changing any styling
PWmedia/          # public resume PDF
```

Client work and its media live in the private repo
[`portfolio-private`](https://github.com/inSAnE1466/portfolio-private) —
nothing on this site links to it.

## Design

The system is locked in `design.md`: Inter/Inter Tight, true black-and-white,
one shared left edge, no hairline rules, two-column paragraph rows, a single
full-bleed ink band per page. A matching Figma file mirrors both pages plus
the token foundations. Change `design.md` first if the system needs to grow.

## Running locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

## Deployment

GitHub Pages via `.github/workflows/static.yml` — push to `main` and it deploys.

© 2026 Frederick Casey-Housand
