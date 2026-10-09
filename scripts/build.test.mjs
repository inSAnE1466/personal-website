import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, parsePost } from './build.mjs';

const source = ({ title = 'A real draft', description = 'A description.', draft = true, body = 'A paragraph.' } = {}) => `---\ntitle: ${title}\ndescription: ${description}\ndraft: ${draft}\n---\n${body}\n`;

async function fixture(t, posts = {}) {
  const root = await mkdtemp(join(tmpdir(), 'personal-blog-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'posts'));
  await mkdir(join(root, 'PWmedia'));
  await writeFile(join(root, 'index.html'), '<head></head><nav><ul><li><a href="/writing/">Writing</a></li><li><a href="https://tinymacro.app/">TinyMacro</a></li></ul></nav><main>Home</main>');
  for (const file of ['tokens.css', 'home.css', 'nav.css', 'writing.css', 'favicon.svg', 'CNAME', 'robots.txt']) {
    await writeFile(join(root, file), `Public fixture: ${file}`);
  }
  await writeFile(join(root, 'sitemap.xml'), '<urlset></urlset>');
  await writeFile(join(root, 'PWmedia', 'image.svg'), '<svg></svg>');
  for (const [slug, content] of Object.entries(posts)) await writeFile(join(root, 'posts', `${slug}.md`), content);
  return { root, read: (path) => readFile(join(root, 'dist', path), 'utf8'), exists: (path) => access(join(root, 'dist', path)) };
}

test('requires explicit draft status, safe slugs and a single page heading, and rejects dates and labels', () => {
  assert.throws(() => parsePost(source({ draft: 'yes' }), 'post.md'), /draft must/);
  assert.throws(() => parsePost(source().replace('draft: true\n', ''), 'post.md'), /missing draft/);
  assert.throws(() => parsePost(source().replace('title: A real draft', 'title: One\ntitle: Two'), 'post.md'), /duplicate metadata/);
  assert.throws(() => parsePost(source(), '../post.md'), /filename/);
  assert.throws(() => parsePost(source({ body: '# Extra title' }), 'post.md'), /use ##/);
  for (const extra of ['date: 2026-09-06', 'kind: case study']) assert.throws(() => parsePost(source().replace('draft: true', `draft: true\n${extra}`), 'post.md'), /invalid or duplicate metadata/);
});

test('lists titles only and renders each post as a plain page', async (t) => {
  const f = await fixture(t, { 'b-post': source({ draft: false, title: 'Second', body: '## One\n\nText.\n\n## Two\n\nText.\n\n## Three\n\nText.' }), 'a-post': source({ draft: false, title: 'First' }) });
  await build({ root: f.root });
  const index = await f.read('writing/index.html');
  assert.match(index, /<ul class="titles"><li><a href="\/writing\/a-post\/">First →<\/a><\/li>\n<li><a href="\/writing\/b-post\/">Second →<\/a><\/li><\/ul>/);
  assert.doesNotMatch(index, /A description|<time|<article/);
  const article = await f.read('writing/b-post/index.html');
  assert.doesNotMatch(article, /<time|class="dek"|class="contents"|A description\.<\/p>|back-link|reach-head/);
  assert.doesNotMatch(index, /reach-head/);
  assert.match(article, /<h2>Three<\/h2>/);
});

test('treats raw HTML as text and rejects unsafe Markdown links', () => {
  const post = parsePost(source({ body: '<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n![bad](javascript:alert(1))' }), 'post.md');
  assert.ok(!post.body.includes('<script>'));
  assert.ok(!post.body.includes('href="javascript:'));
  assert.ok(!post.body.includes('src="javascript:'));
});

test('renders a complete directly addressable published article with escaped metadata and Markdown', async (t) => {
  const f = await fixture(t, { 'published-post': source({
    title: 'Words & <tags> "quoted"', description: 'A "quote" & <script>example</script>', draft: false,
    body: 'A **strong** paragraph.\n\n## A section\n\n[Home](/index.html)\n\n> A quotation\n\n- First\n- Second\n\n| Name | Value |\n| --- | --- |\n| One | Two |\n\n```html\n<div>example</div>\n```',
  }) });
  await build({ root: f.root });
  const article = await f.read('writing/published-post/index.html');
  assert.match(article, /^<!doctype html>/);
  assert.match(article, /<h1>Words &amp; &lt;tags&gt; &quot;quoted&quot;<\/h1>/);
  assert.match(article, /content="A &quot;quote&quot; &amp; &lt;script&gt;example&lt;\/script&gt;"/);
  assert.match(article, /rel="canonical" href="https:\/\/frederickcaseyhousand.com\/writing\/published-post\/"/);
  for (const expected of ['<strong>strong</strong>', '<h2>A section</h2>', '<blockquote>', '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>', '</table></div>', '&lt;div&gt;example&lt;/div&gt;', 'href="/writing.css"', 'href="/writing/"', 'href="#main"', 'id="main"']) assert.ok(article.includes(expected), expected);
  assert.doesNotMatch(article, /draft-note|noindex|<script>/);
  assert.match(await f.read('writing/index.html'), /href="\/writing\/published-post\/"/);
  assert.match(await f.read('sitemap.xml'), /\/writing\/published-post\//);
});

test('previews owner drafts without calling them samples, then removes drafts from public output', async (t) => {
  const f = await fixture(t, { 'owner-draft': source(), published: source({ draft: false, title: 'Published' }) });
  await writeFile(join(f.root, 'private-notes.md'), 'Unlisted source');
  await symlink(join(f.root, 'missing-private-target'), join(f.root, 'thesis'));
  await build({ root: f.root, drafts: true });
  const draft = await f.read('writing/owner-draft/index.html');
  assert.match(draft, /Draft for review/);
  assert.match(draft, /noindex, nofollow/);
  assert.doesNotMatch(draft, /sample|demonstration|not a finished post by Fred|rel="canonical"/);
  assert.match(await f.read('writing/index.html'), /Local preview/);
  assert.match(await f.read('index.html'), /noindex, nofollow/);
  assert.match(await f.read('index.html'), /href="\/writing\/"/);
  assert.match(await f.read('writing/index.html'), /href="\/writing\/owner-draft\/"/);
  assert.match(await f.read('writing/published/index.html'), /noindex, nofollow/);
  assert.doesNotMatch(await f.read('sitemap.xml'), /owner-draft/);
  await build({ root: f.root });
  await assert.rejects(f.exists('writing/owner-draft/index.html'));
  for (const path of ['posts', 'thesis', 'private-notes.md']) await assert.rejects(f.exists(path));
  assert.doesNotMatch(await f.read('writing/index.html'), /owner-draft|Local preview|noindex/);
  assert.doesNotMatch(await f.read('index.html'), /owner-draft|Local preview|noindex/);
  assert.match(await f.read('index.html'), /href="\/writing\/"/);
  assert.match(await f.read('writing/published/index.html'), /<h1>Published<\/h1>/);
  await f.exists('PWmedia/image.svg');
});

test('builds an empty index without a retained sample or any posts', async (t) => {
  const f = await fixture(t);
  await build({ root: f.root });
  assert.match(await f.read('writing/index.html'), /No posts published yet/);
  assert.doesNotMatch(await f.read('index.html'), /href="\/writing\/"/);
  assert.match(await f.read('index.html'), /href="https:\/\/tinymacro.app\/"/);
  assert.doesNotMatch(await f.read('writing/index.html'), /class="titles"/);
  assert.doesNotMatch(await f.read('sitemap.xml'), /\/writing\//);
});

test('normalizes draft metadata and hides Writing when only drafts exist', async (t) => {
  const content = source().replace('draft: true', 'draft: true  ').replaceAll('\n', '\r\n');
  assert.equal(parsePost(content, 'owner-draft.md').draft, true);
  const f = await fixture(t, { 'owner-draft': content });
  await build({ root: f.root, drafts: true });
  assert.match(await f.read('index.html'), /href="\/writing\/"/);
  await f.exists('writing/owner-draft/index.html');
  await build({ root: f.root });
  await assert.rejects(f.exists('writing/owner-draft/index.html'));
  for (const path of ['index.html', 'writing/index.html', 'sitemap.xml']) assert.doesNotMatch(await f.read(path), /owner-draft/);
  assert.doesNotMatch(await f.read('index.html'), /href="\/writing\/"/);
});

test('rejects symlinks nested in public media without reading their targets', async (t) => {
  const f = await fixture(t);
  await symlink(join(f.root, 'missing-private-target'), join(f.root, 'PWmedia', 'linked-content'));
  await assert.rejects(build({ root: f.root }), /not symlinks/);
  await assert.rejects(f.exists('PWmedia/linked-content'));
});

test('builds an empty index when a fresh checkout has no posts directory', async (t) => {
  const f = await fixture(t);
  await rm(join(f.root, 'posts'), { recursive: true });
  await build({ root: f.root });
  assert.match(await f.read('writing/index.html'), /No posts published yet/);
});

test('rejects post source symlinks before reading targets or replacing output', async (t) => {
  const f = await fixture(t);
  await build({ root: f.root });
  const original = await f.read('writing/index.html');
  await symlink(join(f.root, 'missing-owner-original.md'), join(f.root, 'posts', 'linked-post.md'));
  await assert.rejects(build({ root: f.root }), /Post sources must not be symlinks/);
  assert.equal(await f.read('writing/index.html'), original);
});

test('rejects a linked home template before replacing output', async (t) => {
  const f = await fixture(t);
  await build({ root: f.root });
  const original = await f.read('index.html');
  await rm(join(f.root, 'index.html'));
  await symlink(join(f.root, 'missing-private-home.html'), join(f.root, 'index.html'));
  await assert.rejects(build({ root: f.root }), /not symlinks/);
  assert.equal(await f.read('index.html'), original);
});

test('rejects a linked posts directory instead of treating its missing target as empty', async (t) => {
  const f = await fixture(t);
  await rm(join(f.root, 'posts'), { recursive: true });
  await symlink(join(f.root, 'missing-owner-directory'), join(f.root, 'posts'));
  await assert.rejects(build({ root: f.root }), /Post sources must not be symlinks/);
});


test('preview origins affect draft previews only', async (t) => {
  const f = await fixture(t, { draft: source() });
  await build({ root: f.root, drafts: true, tinyMacroOrigin: 'http://127.0.0.1:5191' });
  assert.match(await f.read('writing/index.html'), /href="http:\/\/127\.0\.0\.1:5191\/"/);
  assert.match(await f.read('writing/draft/index.html'), /href="http:\/\/127\.0\.0\.1:5191\/"/);
  await build({ root: f.root, tinyMacroOrigin: 'http://127.0.0.1:5191' });
  assert.match(await f.read('writing/index.html'), /href="https:\/\/tinymacro\.app\/"/);
  assert.doesNotMatch(await f.read('writing/index.html'), /127\.0\.0\.1/);
  await assert.rejects(build({ root: f.root, drafts: true, tinyMacroOrigin: 'https://example.com' }), /loopback/);
});
