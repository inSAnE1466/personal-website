import { cp, lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
markdown.renderer.rules.table_open = () => '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';
// Section headings get stable anchors so long essays and case studies can list their contents.
markdown.core.ruler.push('heading_ids', (state) => {
  const used = new Set();
  state.tokens.forEach((token, i) => {
    if (token.type !== 'heading_open' || token.tag !== 'h2') return;
    const base = state.tokens[i + 1].content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
    let id = base;
    for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    token.attrSet('id', id);
  });
});
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const origin = 'https://frederickcaseyhousand.com';

export function parsePost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: start with metadata between --- lines`);
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(title|date|description|draft|kind): (.+)$/);
    if (!field || field[1] in metadata) throw new Error(`${filename}: invalid or duplicate metadata: ${line}`);
    metadata[field[1]] = field[2].trim();
  }
  for (const field of ['title', 'description', 'draft']) {
    if (!metadata[field]) throw new Error(`${filename}: missing ${field}`);
  }
  if (metadata.date && (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) || !Number.isFinite(Date.parse(metadata.date)) || new Date(metadata.date).toISOString().slice(0, 10) !== metadata.date)) throw new Error(`${filename}: date must be YYYY-MM-DD`);
  if (!['true', 'false'].includes(metadata.draft)) throw new Error(`${filename}: draft must be true or false`);
  metadata.kind ??= 'essay';
  if (!['essay', 'case study'].includes(metadata.kind)) throw new Error(`${filename}: kind must be essay or case study`);
  const slug = filename.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename}: use a lowercase, hyphenated filename`);
  const tokens = markdown.parse(match[2], {});
  if (tokens.some((token) => token.type === 'heading_open' && token.tag === 'h1')) throw new Error(`${filename}: use ## for headings; title supplies the page heading`);
  const sections = tokens.flatMap((token, i) => token.type === 'heading_open' && token.tag === 'h2' ? [{ id: token.attrGet('id'), title: tokens[i + 1].content }] : []);
  return { ...metadata, slug, draft: metadata.draft === 'true', sections, body: markdown.renderer.render(tokens, markdown.options, {}) };
}

const dateLabel = (date) => new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));
const kindLabel = (post) => post.kind === 'case study' ? 'Case study' : 'Essay';
const meta = (post) => `<p class="post-meta">${post.draft ? 'Draft · ' : ''}${kindLabel(post)}${post.date ? ` · <time datetime="${post.date}">${dateLabel(post.date)}</time>` : ''}</p>`;
const nav = `<nav class="site-nav" aria-label="Primary"><a class="site-nav__name" href="/">Fred Casey-Housand</a><ul class="site-nav__links">
<li><a href="/writing/" aria-current="page">Writing</a></li>
</ul></nav>`;
const contact = `<section class="section doc" aria-labelledby="reach-head"><h2 id="reach-head">Write to me</h2><div class="section__body"><p><a href="mailto:frederickcaseyhousand@gmail.com">frederickcaseyhousand@gmail.com</a></p></div></section>`;
const entryList = (posts, h) => posts.length ? `<ul class="entries">${posts.map((post) => `<li><article>${meta(post)}<${h}><a href="/writing/${post.slug}/">${escape(post.title)}</a></${h}><p>${escape(post.description)}</p></article></li>`).join('\n')}</ul>` : '<p class="entries-empty">No posts published yet.</p>';
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
  const sourceDirectory = resolve(root, 'posts');
  const sourceStat = await lstat(sourceDirectory).catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (sourceStat?.isSymbolicLink()) throw new Error(`Post sources must not be symlinks: ${sourceDirectory}`);
  const files = sourceStat ? (await readdir(sourceDirectory)).filter((file) => file.endsWith('.md')) : [];
  // Validate all source before replacing the generated output; never follow links to owner originals.
  const all = await Promise.all(files.map(async (file) => {
    const path = resolve(sourceDirectory, file);
    if ((await lstat(path)).isSymbolicLink()) throw new Error(`Post sources must not be symlinks: ${path}`);
    return parsePost(await readFile(path, 'utf8'), file);
  }));
  const posts = all.filter((post) => drafts || !post.draft).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.slug.localeCompare(b.slug));
  const homePath = resolve(root, 'index.html');
  if ((await lstat(homePath)).isSymbolicLink()) throw new Error(`Public assets must be regular files or directories, not symlinks: ${homePath}`);
  const home = await readFile(homePath, 'utf8');
  if (!home.includes('<!-- writing -->')) throw new Error('index.html: missing <!-- writing --> marker for the writing list');
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, 'writing'), { recursive: true });
  // Explicit public allowlist: never upload sources, drafts, or workspace symlinks.
  const publicFiles = ['tokens.css', 'home.css', 'writing.css', 'favicon.svg', 'CNAME', 'robots.txt'];
  for (const optional of ['PWmedia', 'design-system']) if (await lstat(resolve(root, optional)).catch(() => null)) publicFiles.push(optional);
  for (const file of publicFiles) {
    await cp(resolve(root, file), resolve(output, file), { recursive: true, filter: async (source) => {
      if ((await lstat(source)).isSymbolicLink()) throw new Error(`Public assets must be regular files or directories, not symlinks: ${source}`);
      return true;
    } });
  }
  await writeFile(resolve(output, '.nojekyll'), '');
  await writeFile(resolve(output, 'index.html'), home.replace('<!-- writing -->', entryList(posts, 'h3')).replace('<head>', drafts ? '<head>\n    <meta name="robots" content="noindex, nofollow">' : '<head>'));
  const previewNote = drafts ? '<p class="draft-note"><strong>Local review preview.</strong> Drafts appear here for review and are excluded from the normal build.</p>' : '';
  await writeFile(resolve(output, 'writing/index.html'), page('Writing', 'Essays and case studies by Frederick Casey-Housand.', '/writing/', `<section class="hero doc"><h1>Writing</h1><p class="lede">Essays on what I think technology is for, and case studies of systems I have built.</p>${previewNote}</section><section class="doc writing-list" aria-label="Posts">${entryList(posts, 'h2')}</section>`, drafts));
  for (const post of posts) {
    const path = `/writing/${post.slug}/`;
    await mkdir(resolve(output, 'writing', post.slug), { recursive: true });
    await writeFile(resolve(output, 'writing', post.slug, 'index.html'), page(post.title, post.description, path, `<article class="doc writing-article"><header><a class="back-link" href="/writing/">All writing</a>${meta(post)}<h1>${escape(post.title)}</h1><p class="dek">${escape(post.description)}</p>${post.draft ? '<p class="draft-note"><strong>Draft for review.</strong> This post is excluded from the normal build.</p>' : ''}</header>${post.sections.length >= 3 ? `<nav class="contents" aria-label="Contents"><p>Contents</p><ol>${post.sections.map((s) => `<li><a href="#${s.id}">${escape(s.title)}</a></li>`).join('')}</ol></nav>` : ''}<div class="prose">${post.body}</div></article>`, post.draft || drafts));
  }
  const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
  const urls = ['/writing/', ...all.filter((post) => !post.draft).map((post) => `/writing/${post.slug}/`)];
  await writeFile(resolve(output, 'sitemap.xml'), sitemap.replace('</urlset>', `${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>`));
  console.log(`Built ${posts.length} post(s) in dist/${drafts ? ' (local draft preview)' : ''}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await build({ drafts: process.argv.includes('--drafts') });
