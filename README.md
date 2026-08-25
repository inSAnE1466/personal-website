# frederickcaseyhousand.com

Personal site. No frameworks, no build step — HTML and CSS.

## Structure

```
index.html        # current work, technical opinions, and contact
consulting.html   # consulting page
tokens.css        # design tokens (colors, type, spacing, motion)
home.css          # page styles (both pages)
design.md         # the locked design system — read before changing any styling
favicon.svg       # shared TinyMacro browser-tab mark
sitemap.xml       # indexed public pages and revision dates
PWmedia/          # public resume PDF
```

Client work and its media live in the private repo
[`portfolio-private`](https://github.com/inSAnE1466/portfolio-private) —
nothing on this site links to it.

## Design

The system is locked in `design.md`: Arial, pure white paper, near-black ink,
compact normal-flow text navigation, one shared reading edge, and restrained
hairline section rules. The consulting page alone may use one full-width black
band. Both pages end with their contact section and have no footer. Change
`design.md` first when the public direction changes.

## Running locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

## Deployment

GitHub Pages via `.github/workflows/static.yml` — push to `main` and it deploys.

© 2026 Frederick Casey-Housand
