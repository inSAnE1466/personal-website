---
name: verify-personal-markdown-blog
description: Drive the personal Markdown site locally and prove the home, writing and article routes, draft exclusion, and the absent resume and consulting pages with CLI checks and browser evidence.
---

# Verify personal Markdown blog

Use this skill after changes to the static personal site. It builds and serves a
local preview. It does not publish, submit forms, or contact external services.

## Run

```sh
npm ci
npx playwright install chromium   # once per machine
node .agents/skills/verify-personal-markdown-blog/verify.mjs run [port]
```

`run` does four things in order and stops at the first failure:

1. Public build: runs `npm run build`, then proves every `draft: true` post is
   absent from `dist/writing/`, from the home and writing index links and from
   the sitemap, and that `resume.html`, `consulting.html` and the old resume PDF
   are absent from `dist/`.
2. Preview: rebuilds with drafts and serves `dist` with Python on the given port,
   or a free temporary port. It never reuses a port another process holds.
3. Doctor: `/` and `/writing/` return HTML; `/resume.html` and `/consulting.html`
   return 404.
4. Drive: headless Chromium at 1280x800 and 390x844. Tab from the top of home:
   the first stop is the visible skip link, then Fred Casey-Housand, then Writing. Then it opens
   Writing from the nav and every listed post in turn, returning through the nav.
   Each post must be a plain page with no date, dek, contents, label, back link or
   table. Every page is checked for horizontal overflow and captured full page.

The helper stops the exact server process it started.

## Against a running preview

```sh
node .agents/skills/verify-personal-markdown-blog/verify.mjs doctor http://127.0.0.1:<port>
node .agents/skills/verify-personal-markdown-blog/verify.mjs drive http://127.0.0.1:<port>
```

The drive needs at least one listed post, so point it at a draft preview
(`node scripts/build.mjs --drafts`) while no post is published.

## Evidence

JSON transcripts and screenshots go to `.artifacts/verify/` (ignored by Git).
Read every screenshot. A passing run proves routes, overflow and focus order,
not that the page reads well. Do not activate email, calendar or external links.
