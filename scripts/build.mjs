import { cp, lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
markdown.renderer.rules.table_open = () => '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const origin = 'https://frederickcaseyhousand.com';

export function parsePost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: start with metadata between --- lines`);
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(title|description|draft): (.+)$/);
    if (!field || field[1] in metadata) throw new Error(`${filename}: invalid or duplicate metadata: ${line}`);
    metadata[field[1]] = field[2].trim();
  }
  for (const field of ['title', 'description', 'draft']) {
    if (!metadata[field]) throw new Error(`${filename}: missing ${field}`);
  }
  if (!['true', 'false'].includes(metadata.draft)) throw new Error(`${filename}: draft must be true or false`);
  const slug = filename.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename}: use a lowercase, hyphenated filename`);
  if (markdown.parse(match[2], {}).some((token) => token.type === 'heading_open' && token.tag === 'h1')) throw new Error(`${filename}: use ## for headings; title supplies the page heading`);
  return { ...metadata, slug, draft: metadata.draft === 'true', body: markdown.render(match[2]) };
}

const nav = `<nav class="site-nav" aria-label="Primary">
        <a class="site-nav__name" href="/">Fred Casey-Housand</a>
        <ul class="site-nav__links">
            <li><a href="/writing/" aria-current="page">Writing</a></li>
            <li><a class="site-nav__tm" href="https://tinymacro.app/"><svg viewBox="1 4 13 8" aria-hidden="true" focusable="false"><rect x="1.3" y="4.3" width="7.4" height="7.4"/><rect x="9.3" y="4.3" width="4.4" height="4.4"/><rect x="11.3" y="9.3" width="2.4" height="2.4"/><rect x="9.3" y="10.3" width="1.4" height="1.4"/></svg>TinyMacro <span aria-hidden="true">↗</span></a></li>
        </ul>
    </nav>`;
// Titles only, set large: no dates, labels or descriptions.
const titleList = (posts) => posts.length ? `<ul class="titles">${posts.map((post) => `<li><a href="/writing/${post.slug}/">${escape(post.title)} →</a></li>`).join('\n')}</ul>` : '<p>No posts published yet.</p>';
function page(title, description, path, body, draft = false) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Frederick Casey-Housand</title><meta name="description" content="${escape(description)}">
${draft ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${origin}${path}">`}
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/home.css"><link rel="stylesheet" href="/writing.css"><link rel="stylesheet" href="/nav.css"></head>
<body><a class="skip" href="#main">Skip to content</a>${nav}<main id="main">${body}</main></body></html>\n`;
}

export async function build({ root = process.cwd(), drafts = false, tinyMacroOrigin = process.env.PERSONAL_TINYMACRO_ORIGIN } = {}) {
  let previewOrigin;
  if (drafts && tinyMacroOrigin) {
    const url = new URL(tinyMacroOrigin);
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('Preview TinyMacro origin must be a loopback HTTP origin');
    previewOrigin = url.origin;
  }
  const previewLinks = html => previewOrigin ? html.replace(/href="https:\/\/tinymacro\.app(\/[^" ]*)?"/g, (_, suffix) => `href="${previewOrigin}${suffix || '/'}"`) : html;
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
  const posts = all.filter((post) => drafts || !post.draft).sort((a, b) => a.slug.localeCompare(b.slug));
  const homePath = resolve(root, 'index.html');
  if ((await lstat(homePath)).isSymbolicLink()) throw new Error(`Public assets must be regular files or directories, not symlinks: ${homePath}`);
  const home = await readFile(homePath, 'utf8');
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, 'writing'), { recursive: true });
  // Explicit public allowlist: never upload sources, drafts, or workspace symlinks.
  const publicFiles = ['tokens.css', 'home.css', 'nav.css', 'writing.css', 'favicon.svg', 'CNAME', 'robots.txt'];
  for (const optional of ['PWmedia', 'design-system']) if (await lstat(resolve(root, optional)).catch(() => null)) publicFiles.push(optional);
  for (const file of publicFiles) {
    await cp(resolve(root, file), resolve(output, file), { recursive: true, filter: async (source) => {
      if ((await lstat(source)).isSymbolicLink()) throw new Error(`Public assets must be regular files or directories, not symlinks: ${source}`);
      return true;
    } });
  }
  await writeFile(resolve(output, '.nojekyll'), '');
  // Writing stays out of the nav until a post is published (draft: false).
  const writingNav = (html) => posts.length ? html : html.replace(/\s*<li><a href="\/writing\/"[^>]*>Writing<\/a><\/li>/, '');
  await writeFile(resolve(output, 'index.html'), writingNav(previewLinks(home.replace('<head>', drafts ? '<head>\n    <meta name="robots" content="noindex, nofollow">' : '<head>'))));
  const previewNote = drafts ? '<p class="draft-note">Local preview. Drafts are listed here and excluded from the public build.</p>' : '';
  await writeFile(resolve(output, 'writing/index.html'), previewLinks(page('Writing', 'Writing by Frederick Casey-Housand.', '/writing/', `<section class="doc writing-list"><h1>Writing</h1>${previewNote}${titleList(posts)}</section>`, drafts)));
  for (const post of posts) {
    const path = `/writing/${post.slug}/`;
    await mkdir(resolve(output, 'writing', post.slug), { recursive: true });
    await writeFile(resolve(output, 'writing', post.slug, 'index.html'), previewLinks(page(post.title, post.description, path, `<article class="doc writing-article"><h1>${escape(post.title)}</h1>${post.draft ? '<p class="draft-note">Draft for review. Excluded from the public build.</p>' : ''}<div class="prose">${post.body}</div></article>`, post.draft || drafts)));
  }
  const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
  const urls = [...(posts.length ? ['/writing/'] : []), ...all.filter((post) => !post.draft).map((post) => `/writing/${post.slug}/`)];
  await writeFile(resolve(output, 'sitemap.xml'), sitemap.replace('</urlset>', `${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>`));
  console.log(`Built ${posts.length} post(s) in dist/${drafts ? ' (local draft preview)' : ''}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await build({ drafts: process.argv.includes('--drafts') });
