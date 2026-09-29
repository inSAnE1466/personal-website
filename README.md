# frederickcaseyhousand.com

Fred's personal site: a home page with his intentions, and writing. The home page is plain HTML/CSS;
the build inserts the writing list at its `<!-- writing -->` marker. There is no resume page.
Writing uses Markdown, converted to static HTML by a small Node script. There is
no browser JavaScript, CMS, or account service for the blog. Inter and the existing
writing voice remain the design constraints.

This is Fred’s writing and social proof. The [current workspace direction](/Users/fredcaseyhousand/Desktop/github/tinymacro-workspace/OWNER-CONTEXT.md)
keeps it separate from the company’s case studies and any acquisition experiment.
[TMH’s company thesis](/Users/fredcaseyhousand/Desktop/github/tm-harness/thesis/company-thesis.md)
owns company/client claims; this site does not establish them.

`product-tracker.md` is the pointer index for current work and durable documentation. It does not
own writing, publication authority, or a product backlog.

## Next useful slice

Two owner drafts copied from the vault note `Buckets/Writing/cta.md` (`posts/why-the-environment.md`,
`posts/what-general-agents-cannot-do.md`) and one case study drawn from PH runtime source
(`posts/per-vertical-agent-permissions.md`) are `draft: true`. They
appear only in the preview. Fred approves, edits or deletes each before any becomes public. Case
studies about client work need TMH's claim rules below and Fred's approval of every fact.

Company case-study inputs and permission stay with TMH, which owns company and client truth. Its claim rules live in [references/claims-spine.md](/Users/fredcaseyhousand/Desktop/github/tm-harness/references/claims-spine.md) and its consulting method in [docs/consulting-delivery-system.md](/Users/fredcaseyhousand/Desktop/github/tm-harness/docs/consulting-delivery-system.md);
private portfolio sources remain outside this work.

## Local review

Requires Node 22+ and Python 3:

```bash
npm ci
npm test
npm run preview
```

Open [the writing index](http://127.0.0.1:8011/writing/) and the linked drafts. The preview includes
drafts with a generic “Draft for review” notice and marks writing pages `noindex`.
Stop the server with Ctrl-C. After editing a post, rerun `npm run preview` to
rebuild it (there is no watch server). If port 8011 is already serving this
worktree, stop that preview before starting another.

For the public build, run `npm run build`, then serve `dist`:

```bash
python3 -m http.server 8011 --bind 127.0.0.1 --directory dist
```

The normal build excludes drafts and removes any earlier preview output. With no
published posts, the writing index says “No posts published yet.” This also works
when `posts/` is absent.

## Add a post

1. Copy owner-selected writing into `posts/a-short-title.md`. Preserve the original
   wherever Fred wrote it; this workflow does not read or sync Obsidian. Create
   `posts/` if it is absent. The directory and Markdown sources must be actual
   copies, not symlinks to originals.
2. Add these plain-text metadata fields. Values are single lines, without YAML
   quotes. `kind` is `essay` (the default) or `case study`. `date` is optional (`YYYY-MM-DD`);
   leave it out for past work, which carries no dates. The filename becomes the permanent URL.

   ```markdown
   ---
   title: The title of the post
   description: A short description for the index and the article's opening line.
   kind: essay
   draft: true
   ---
   The first paragraph goes here.

   ## A section heading

   More writing.
   ```

3. Preview and review the page. The title supplies the only H1; use `##` and `###`
   within the body. A piece with three or more `##` sections lists them as contents. A case
   study can open with a two-column summary table. Markdown supports lists, links, quotations, tables, and fenced
   code. Raw HTML is displayed as text. Local image files can go in `PWmedia/` and
   be referenced as `![Meaningful description](/PWmedia/filename.png)`. Every file
   in `PWmedia/` is copied to the public build, even if only a draft references it.
   Keep unapproved or private media outside that directory.
4. When Fred approves the text for publication, change `draft: true` to `draft: false`.
   Run `npm test` and `npm run build`, then inspect the result.
5. Review the commit before the separately authorized publishing step.

Tests use temporary fixtures and do not depend on any post in `posts/`.

## Structure

- `index.html`: home page template; the build adds the writing list.
- `posts/*.md`: writing source; draft status is required.
- `scripts/build.mjs`: metadata validation, Markdown rendering and page templates.
- `scripts/build.test.mjs`: draft exclusion and content-safety checks.
- `tokens.css`, `home.css`, `writing.css`: shared Inter styles and the writing layout.
- `design-system/`: tokens and Inter pinned from TMFA; see `provenance.json`.
- `PWmedia/`: optional public media, copied to the build only when present.
- `design.md`: visual direction.
- `dist/`: generated public files; ignored by Git.

The build copies an explicit list of public files. It does not copy Markdown
sources or repository files, and rejects symlinks inside the public asset list.
Only published posts enter the sitemap. No existing owner writing was imported or rewritten for this preparation.

## Deployment

GitHub Pages uses `.github/workflows/static.yml`. A push to `main` runs the tests
and public build, then deploys only `dist/`. **Pushing main publishes the site;
manual `workflow_dispatch` can also deploy.** Both need separate authorization.
Prepare future work on a review branch until Fred explicitly authorizes site publication;
general repository cleanup or mainline reconciliation does not grant that authority.
Review branches and local previews do not deploy. This preparation does not
authorize a push, merge, or deployment.

Client work and its media remain in the private portfolio repository, unlinked.

© 2026 Frederick Casey-Housand

## Checks

`npm test` runs isolated fixture builds: draft exclusion from home, index, routes and sitemap;
escaped metadata and Markdown; optional dates and kinds; heading anchors; and rejected source,
home-template and media symlinks. `node .agents/skills/verify-personal-markdown-blog/verify.mjs run`
proves draft exclusion on the public build, then drives the draft preview at 1280 and 390 px.
There is no lint script.
