---
name: verify-personal-markdown-blog
description: Drive the personal Markdown site locally and prove public and draft writing routes with CLI checks and browser evidence.
---

# Verify personal Markdown blog

Use this skill after changes to the static personal site. It builds and serves a
local preview. It does not publish, submit forms, or contact external services.

## Launch

Install the lockfile and run the helper. It builds the public site, starts an
isolated Python server on port 8011, and owns teardown:

```sh
npm ci
node .agents/skills/verify-personal-markdown-blog/verify.mjs run
```

The server is ready when the helper's doctor reports HTML for `/` and
`/writing/`. For a browser review, run `npm run build` and then
`python3 -m http.server 8011 --bind 127.0.0.1 --directory dist`, stopping that
exact process after the drive.

## Doctor

Run this against an existing preview before driving it:

```sh
node .agents/skills/verify-personal-markdown-blog/verify.mjs doctor http://127.0.0.1:8011
```

It checks the home, consulting, and writing index responses plus the published
post set. A failed doctor means rebuild and relaunch the preview.

## Drive

Run the route drive:

```sh
node .agents/skills/verify-personal-markdown-blog/verify.mjs drive http://127.0.0.1:8011
```

Then use a browser at the same origin. Inspect home, consulting, writing index,
and the sample post when present at desktop and mobile widths. Follow `Writing`
and `All writing` links and confirm the title, date, and content. Use visible
links and headings, not coordinates. Do not activate email, calendar, or
external TinyMacro links.

## Evidence

The helper writes timestamped JSON transcripts under
`.agents/skills/verify-personal-markdown-blog/.artifacts/`. Browser screenshots
belong there and must show the route and resulting state. A build and test pass
alone does not prove rendered behavior.

## Cleanup

The helper stops the exact Python process it starts and leaves evidence in
place. Manual drives must stop the recorded server PID. Never kill by process
name.

## Helpers

`verify.mjs` uses Node's built-in HTTP client and the existing build script. Its
supported commands are `doctor`, `drive`, and `run`.
