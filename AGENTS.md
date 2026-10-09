# Personal website

<!-- budget: 32 -->

This repository owns Fred's personal writing and social proof surface at `frederickcaseyhousand.com`.
It does not establish company or client claims.

`README.md` is this repository's codebase context. It owns the structure, the post format, the build
and preview commands, the deployment gate, and the claims that still need review. [Generated file index](docs/FILES.md). Rebuild from tinymacro-workspace with `npm run file-index`.

Workspace policy in `../tinymacro-workspace/AGENTS.md` owns the map, commit rule, verification duty,
and vault route. For unfamiliar claims use workspace [find-context](../tinymacro-workspace/.agents/skills/find-context/SKILL.md); for legacy judgments use [do-we-need-this](../tinymacro-workspace/.agents/skills/do-we-need-this/SKILL.md).

## Checks by change type

| Change | Check |
| --- | --- |
| Post content or metadata | `npm test`, then `npm run preview` and read the rendered page |
| Build script or template | `npm test` |
| Layout, tokens, or styles | `npm run preview` at desktop and mobile widths |
| Public build shape | `npm run build`, then inspect `dist` |
| End to end, local build and sample draft, not deployed or approved writing | `node .agents/skills/verify-personal-markdown-blog/verify.mjs run`. A pull request runs `npm test` through `.github/workflows/verify.yml` |
| Documentation only | Link and diff review. No test run |

`npm run preview` includes drafts with a notice and marks writing pages `noindex`. The public build
excludes drafts. Rerun after editing a post; there is no watch server. For non-trivial work, use
the workspace [pstack adapter](../tinymacro-workspace/.agents/skills/pstack/SKILL.md) and its matching playbook, not copied toolkits or model choices.

## Effect ceiling
A push to `main` publishes the site, and manual `workflow_dispatch` also deploys. Both need separate
authorization. Preview and build are local and grant no publication authority. Keep work on a review
branch until the owner authorizes publication.
