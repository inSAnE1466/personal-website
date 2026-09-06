import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, parsePost } from './build.mjs';

const source = ({ title = 'A real draft', date = '2026-09-06', description = 'A description.', draft = true, body = 'A paragraph.' } = {}) => `---\ntitle: ${title}\ndate: ${date}\ndescription: ${description}\ndraft: ${draft}\n---\n${body}\n`;

async function fixture(t, posts = {}) {
  const root = await mkdtemp(join(tmpdir(), 'personal-blog-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'posts'));
  await mkdir(join(root, 'PWmedia'));
  for (const file of ['index.html', 'consulting.html', 'tokens.css', 'home.css', 'writing.css', 'favicon.svg', 'CNAME', 'robots.txt']) {
    await writeFile(join(root, file), `Public fixture: ${file}`);
  }
  await writeFile(join(root, 'sitemap.xml'), '<urlset></urlset>');
  await writeFile(join(root, 'PWmedia', 'image.svg'), '<svg></svg>');
  for (const [slug, content] of Object.entries(posts)) await writeFile(join(root, 'posts', `${slug}.md`), content);
  return { root, read: (path) => readFile(join(root, 'dist', path), 'utf8'), exists: (path) => access(join(root, 'dist', path)) };
}

test('requires explicit draft status, valid dates, safe slugs and a single page heading', () => {
  assert.throws(() => parsePost(source({ draft: 'yes' }), 'post.md'), /draft must/);
  assert.throws(() => parsePost(source({ date: '2026-02-30' }), 'post.md'), /date must/);
  assert.throws(() => parsePost(source().replace('draft: true\n', ''), 'post.md'), /missing draft/);
  assert.throws(() => parsePost(source().replace('title: A real draft', 'title: One\ntitle: Two'), 'post.md'), /duplicate metadata/);
  assert.throws(() => parsePost(source(), '../post.md'), /filename/);
  assert.throws(() => parsePost(source({ body: '# Extra title' }), 'post.md'), /use ##/);
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
  assert.match(await f.read('writing/index.html'), /Draft · /);
  assert.match(await f.read('writing/published/index.html'), /noindex, nofollow/);
  assert.doesNotMatch(await f.read('sitemap.xml'), /owner-draft/);
  await build({ root: f.root });
  await assert.rejects(f.exists('writing/owner-draft/index.html'));
  for (const path of ['posts', 'thesis', 'private-notes.md']) await assert.rejects(f.exists(path));
  assert.doesNotMatch(await f.read('writing/index.html'), /owner-draft|Draft · |noindex/);
  assert.match(await f.read('writing/published/index.html'), /<h1>Published<\/h1>/);
  await f.exists('PWmedia/image.svg');
});

test('builds an empty index without a retained sample or any posts', async (t) => {
  const f = await fixture(t);
  await build({ root: f.root });
  assert.match(await f.read('writing/index.html'), /No posts published yet/);
  assert.doesNotMatch(await f.read('writing/index.html'), /<li><article>/);
  assert.match(await f.read('sitemap.xml'), /https:\/\/frederickcaseyhousand.com\/writing\//);
});

test('rejects symlinks nested in public media without reading their targets', async (t) => {
  const f = await fixture(t);
  await symlink(join(f.root, 'missing-private-target'), join(f.root, 'PWmedia', 'linked-content'));
  await assert.rejects(build({ root: f.root }), /not symlinks/);
  await assert.rejects(f.exists('PWmedia/linked-content'));
});
