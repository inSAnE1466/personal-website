import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const origin = 'https://frederickcaseyhousand.com';

export function parsePost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: start with metadata between --- lines`);
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(title|date|description|draft): (.+)$/);
    if (!field || field[1] in metadata) throw new Error(`${filename}: invalid or duplicate metadata: ${line}`);
    metadata[field[1]] = field[2].trim();
  }
  for (const field of ['title', 'date', 'description', 'draft']) {
    if (!metadata[field]) throw new Error(`${filename}: missing ${field}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) || !Number.isFinite(Date.parse(metadata.date)) || new Date(metadata.date).toISOString().slice(0, 10) !== metadata.date) throw new Error(`${filename}: date must be YYYY-MM-DD`);
  if (!['true', 'false'].includes(metadata.draft)) throw new Error(`${filename}: draft must be true or false`);
  const slug = filename.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename}: use a lowercase, hyphenated filename`);
  if (markdown.parse(match[2], {}).some((token) => token.type === 'heading_open' && token.tag === 'h1')) throw new Error(`${filename}: use ## for headings; title supplies the page heading`);
  return { ...metadata, slug, draft: metadata.draft === 'true', body: markdown.render(match[2]) };
}

const dateLabel = (date) => new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));
const nav = `<nav class="site-nav" aria-label="Primary"><ul class="site-nav__links">
<li><a href="/index.html">Home</a></li><li><a href="/writing/" aria-current="page">Writing</a></li><li><a href="/consulting.html">Consulting</a></li><li><a href="https://tinymacro.app" target="_blank" rel="noopener">TinyMacro</a></li><li><a href="https://cal.com/frederick-casey-housand-vy8nkn/tinymacro-general-interest" target="_blank" rel="noopener">Book a call</a></li>
</ul></nav>`;
const contact = `<section class="reach doc" aria-labelledby="reach-head"><h2 id="reach-head">Get in touch</h2><p class="reach__lede"><a href="mailto:frederickcaseyhousand@gmail.com">frederickcaseyhousand@gmail.com</a></p></section>`;
function page(title, description, path, body, draft = false) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Frederick Casey-Housand</title><meta name="description" content="${escape(description)}">
${draft ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${origin}${path}">`}
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/home.css"><link rel="stylesheet" href="/writing.css"></head>
<body><a class="skip" href="#main">Skip to content</a>${nav}<main id="main">${body}${contact}</main></body></html>\n`;
}

export async function build({ root = process.cwd(), drafts = false } = {}) {
  const output = resolve(root, 'dist');
  const files = (await readdir(resolve(root, 'posts'))).filter((file) => file.endsWith('.md'));
  // Validate all source before replacing the generated output.
  const all = await Promise.all(files.map(async (file) => parsePost(await readFile(resolve(root, 'posts', file), 'utf8'), file)));
  const posts = all.filter((post) => drafts || !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, 'writing'), { recursive: true });
  // Explicit public allowlist: never upload sources, drafts, or workspace symlinks.
  for (const file of ['index.html', 'consulting.html', 'tokens.css', 'home.css', 'writing.css', 'favicon.svg', 'CNAME', 'robots.txt', 'PWmedia']) {
    await cp(resolve(root, file), resolve(output, file), { recursive: true });
  }
  await writeFile(resolve(output, '.nojekyll'), '');
  const entries = posts.map((post) => `<li><article><p class="post-meta">${post.draft ? 'Draft sample · ' : ''}<time datetime="${post.date}">${dateLabel(post.date)}</time></p><h2><a href="/writing/${post.slug}/">${escape(post.title)}</a></h2><p>${escape(post.description)}</p></article></li>`).join('\n');
  const previewNote = drafts ? '<p class="draft-note"><strong>Local review preview.</strong> Drafts appear here for review and are excluded from the normal build.</p>' : '';
  await writeFile(resolve(output, 'writing/index.html'), page('Writing', 'Writing by Frederick Casey-Housand.', '/writing/', `<section class="hero doc"><h1>Writing</h1><p class="lede">Notes and essays by Fred Casey-Housand.</p>${previewNote}</section><section class="doc writing-list" aria-label="Posts">${entries ? `<ul>${entries}</ul>` : '<p>No posts published yet.</p>'}</section>`, drafts));
  for (const post of posts) {
    const path = `/writing/${post.slug}/`;
    await mkdir(resolve(output, 'writing', post.slug), { recursive: true });
    await writeFile(resolve(output, 'writing', post.slug, 'index.html'), page(post.title, post.description, path, `<article class="doc writing-article"><header><a class="back-link" href="/writing/">All writing</a><h1>${escape(post.title)}</h1><p class="post-meta"><time datetime="${post.date}">${dateLabel(post.date)}</time></p>${post.draft ? '<p class="draft-note"><strong>Draft sample for layout review.</strong> This is demonstration text, not a finished post by Fred. It is excluded from the normal build.</p>' : ''}</header><div class="prose">${post.body}</div></article>`, post.draft || drafts));
  }
  const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
  const urls = ['/writing/', ...all.filter((post) => !post.draft).map((post) => `/writing/${post.slug}/`)];
  await writeFile(resolve(output, 'sitemap.xml'), sitemap.replace('</urlset>', `${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>`));
  console.log(`Built ${posts.length} post(s) in dist/${drafts ? ' (local draft preview)' : ''}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await build({ drafts: process.argv.includes('--drafts') });
