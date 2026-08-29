# Personal website

This repository owns the public personal website. It contains no private portfolio or client
authority.

## Required context

Before any other repository work, run:

```sh
node .agents/session-context/context-loader.mjs load start
```

After context compaction, handoff, or an uncertain resume, run `load resume` before continuing.
Before delegation, use the installed session-context guide. Reject a subagent result until its
context receipt passes `verify`.

The loader reads this file, `README.md`, and the locked `design.md`. Do not replace it with manual
file pointers. Do not add private portfolio material or client facts. A push to `main` deploys the
site, so do not push or use credentials without exact authority.

Check both pages and their responsive layout before a commit.
