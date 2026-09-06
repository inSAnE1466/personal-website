import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build, parsePost } from './build.mjs';

const sample = await readFile(new URL('../posts/sample-formatting.md', import.meta.url), 'utf8');
test('requires explicit draft status and valid dates', () => {
  assert.throws(() => parsePost(sample.replace('draft: true', 'draft: yes'), 'sample.md'), /draft must/);
  assert.throws(() => parsePost(sample.replace('2026-09-06', '2026-02-30'), 'sample.md'), /date must/);
  assert.throws(() => parsePost(sample.replace('draft: true\n', ''), 'sample.md'), /missing draft/);
});
test('treats raw HTML as text and rejects unsafe Markdown links', () => {
  const post = parsePost(sample + '\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))', 'sample.md');
  assert.ok(!post.body.includes('<script>'));
  assert.ok(!post.body.includes('href="javascript:'));
});
test('production build removes previews and excludes sources and drafts', async () => {
  await build({ drafts: true });
  assert.match(await readFile('dist/writing/sample-formatting/index.html', 'utf8'), /noindex, nofollow/);
  await build();
  await assert.rejects(access('dist/writing/sample-formatting/index.html'));
  await assert.rejects(access('dist/posts'));
  await assert.rejects(access('dist/thesis'));
  assert.match(await readFile('dist/writing/index.html', 'utf8'), /No posts published yet/);
  assert.doesNotMatch(await readFile('dist/sitemap.xml', 'utf8'), /sample-formatting/);
});
