# frederickcaseyhousand.com

Fred's personal site. The existing home and consulting pages are plain HTML/CSS.
Writing uses Markdown, converted to static HTML by a small Node script. There is
no browser JavaScript, CMS, or account service for the blog.

## Local review

Requires Node 22+ and Python 3:

```bash
npm ci
npm test
npm run preview
```

Open http://127.0.0.1:8011/writing/ and the linked draft sample. The preview includes
drafts with a generic “Draft for review” notice and marks writing pages `noindex`.
Stop the server with Ctrl-C. After editing a post, rerun `npm run preview` to rebuild it (there is no watch server).

For the public build, run `npm run build`, then serve `dist`:

```bash
python3 -m http.server 8011 --bind 127.0.0.1 --directory dist
```

The normal build excludes drafts and removes any earlier preview output. With no
published posts, the writing index says “No posts published yet.”

## Add a post

1. Copy owner-selected writing into `posts/a-short-title.md`. Preserve the original
   wherever Fred wrote it; this workflow does not read or sync Obsidian.
2. Add these four plain-text metadata fields. Values are single lines, without YAML
   quotes; dates use `YYYY-MM-DD`. The filename becomes the permanent URL.

   ```markdown
   ---
   title: The title of the post
   date: 2026-09-06
   description: A short description for the index.
   draft: true
   ---
   The first paragraph goes here.

   ## A section heading

   More writing.
   ```

3. Preview and review the page. The title supplies the only H1; use `##` and `###`
   within the body. Markdown supports lists, links, quotations, tables, and fenced
   code. Raw HTML is displayed as text. Local image files can go in `PWmedia/` and
   be referenced as `![Meaningful description](/PWmedia/filename.png)`.
4. When Fred approves the text for publication, change `draft: true` to `draft: false`.
   Run `npm test` and `npm run build`, then inspect the result.
5. Review the commit before the separately authorized publishing step.

`posts/sample-formatting.md` is demonstration text, not Fred's finished writing.
Delete it when it is no longer useful; keep it a draft while retained. Tests use
temporary fixtures and do not depend on this sample. Real drafts use the same
`draft: true` field; only the sample’s own text describes it as illustrative.

## Structure

- `index.html`, `consulting.html`: existing public pages; their prose is unchanged.
- `posts/*.md`: writing source; draft status is required.
- `scripts/build.mjs`: metadata validation, Markdown rendering and page templates.
- `scripts/build.test.mjs`: draft exclusion and content-safety checks.
- `tokens.css`, `home.css`, `writing.css`: shared Arial styles and writing layout.
- `design.md`: visual direction.
- `dist/`: generated public files; ignored by Git.

The build copies an explicit list of public files. It does not copy Markdown
sources or repository files, and rejects symlinks inside the public asset list.
Only published posts enter the sitemap. No existing owner writing was imported or rewritten for this preparation.

## Deployment

GitHub Pages uses `.github/workflows/static.yml`. A push to `main` runs the tests
and public build, then deploys only `dist/`. **Pushing main publishes the site.**
Review branches and local previews do not deploy. This preparation does not
authorize a push, merge, or deployment.

Client work and its media remain in the private portfolio repository, unlinked.

© 2026 Frederick Casey-Housand

## Review checks (2026-09-06)

`npm test` uses six isolated fixture tests, including a published article, a real
owner draft, no posts, escaped metadata/Markdown, and a rejected media symlink.
It does not rebuild the site's preview. `npm run build` excludes the retained
sample and produces the empty public writing index until Fred selects a post.

Fresh Chrome review at 1440, 390, and 320 px covered direct article loading,
index/back navigation, keyboard focus, and synthetic long prose/code/table
content. Wide tables scroll inside a named, keyboard-focusable region; prose
links are underlined. External requests and form submissions were not exercised.
The sample and synthetic fixtures are not owner writing or publication inputs.
