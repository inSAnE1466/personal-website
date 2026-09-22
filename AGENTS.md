# Personal website

<!-- budget: 32 -->

This repository owns Fred's personal writing and social proof surface at `frederickcaseyhousand.com`.
It does not establish company or client claims.

`README.md` is this repository's codebase context. It owns the structure, the post format, the build
and preview commands, the deployment gate, and the claims that still need review.

Workspace policy is owned once in `../tinymacro-workspace/AGENTS.md`: the repository map, the commit
rule, the verification duty, and the vault route. Follow it rather than a copy here.

## Checks by change type

| Change | Check |
| --- | --- |
| Post content or metadata | `npm test`, then `npm run preview` and read the rendered page |
| Build script or template | `npm test` |
| Layout, tokens, or styles | `npm run preview` at desktop and mobile widths |
| Public build shape | `npm run build`, then inspect `dist` |
| End to end, real build | `node .agents/skills/verify-personal-markdown-blog/verify.mjs run`. A pull request runs `npm test` through `.github/workflows/verify.yml` |
| Documentation only | Link and diff review. No test run |

`npm run preview` includes drafts with a notice and marks writing pages `noindex`. The public build
excludes drafts. There is no watch server, so rerun the command after editing a post.

## Effect ceiling

A push to `main` publishes the site, and manual `workflow_dispatch` also deploys. Both need separate
authorization. Preview and build are local and grant no publication authority. Keep work on a review
branch until the owner authorizes publication.
