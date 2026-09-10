# pstack provenance

Pinned copy of pstack, Lauren Tan's engineering-workflow skills, kept here as the authority for how
agent work is planned, executed, verified and reviewed across the six repositories.
Local adaptations live in `.agents/skills/pstack/`; this directory stays unmodified.

| Field | Value |
| --- | --- |
| Upstream | https://github.com/cursor/plugins, directory `pstack/` |
| Pinned commit | `7366ac128bdf95f45e6734f412b49a4031800169` (2026-09-10) |
| Version | 0.15.1 (upstream plugin metadata) |
| Licence | MIT, Copyright (c) 2026 Lauren Tan |
| Vendored | 2026-09-10 |
| Contents | 47 skills, 23 playbooks, 22 principles |

## Included

- `skills/` and `docs/guide/`, unmodified.
- `README.md` and `LICENSE`.

## Excluded

- upstream `docs/guide/images/` and `assets/`. Screenshots and logos with no text.
- `.cursor-plugin/plugin.json`, because its upstream logo reference points to the excluded `assets/` tree.
- `agents/`. Cursor subagent definitions that route to Cursor models. Work here routes to native
  Codex subagents instead, so the Cursor wrappers do not apply.
- `automations/`. Cursor Automation definitions, which no host in this workspace runs.

## Reading it

The skills reference each other by name (`principle-*`, `how`, `why`, `swarm`, and the playbooks
under `poteto-mode/playbooks/`). Upstream text writes paths as `pstack/skills/...`; here the same
files sit under `vendor/pstack/skills/...`.

## Updating

Fetch the named commit from `https://github.com/cursor/plugins.git` into a temporary checkout.
Copy the included paths from its `pstack/` directory without editing upstream files. Retain the
license, record the new revision here, and review the repository adapter at
[`.agents/skills/pstack/SKILL.md`](../../.agents/skills/pstack/SKILL.md).

For this revision, the immutable source archive is
`https://github.com/cursor/plugins/archive/7366ac128bdf95f45e6734f412b49a4031800169.tar.gz`.
The workspace installer distributes this reviewed copy to each repository and reports local conflicts.
It does not silently fetch a newer upstream revision.
