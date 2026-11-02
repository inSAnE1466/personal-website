import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { parsePost } from '../../../scripts/build.mjs';

const root = resolve(import.meta.dirname, '../../..');
const artifacts = resolve(root, '.artifacts', 'verify');
const stamp = new Date().toISOString().replaceAll(':', '-');
const viewports = [{ width: 1280, height: 800 }, { width: 390, height: 844 }];
const routes = [
  ['/', 200, "Hi, I'm Fred."],
  ['/writing/', 200, 'Writing'],
  ['/resume.html', 404, null],
  ['/consulting.html', 404, null],
];

async function evidence(name, data) {
  await mkdir(artifacts, { recursive: true });
  const file = resolve(artifacts, `${stamp}-${name}.json`);
  await writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log(JSON.stringify({ ...data, evidence: file }, null, 2));
}

async function doctor(origin) {
  const results = [];
  for (const [path, status, marker] of routes) {
    const response = await fetch(`${origin}${path}`);
    const body = await response.text();
    if (response.status !== status || (marker && !body.includes(marker))) throw new Error(`${path}: expected ${status}${marker ? ` containing ${marker}` : ''}, got ${response.status}`);
    results.push({ path, status: response.status });
  }
  await evidence('doctor', { origin, results });
}

// The public build must contain no draft: no route, no link from home or the index, no sitemap entry.
async function draftExclusion() {
  const drafts = [];
  for (const file of (await readdir(resolve(root, 'posts')).catch(() => [])).filter((f) => f.endsWith('.md'))) {
    const post = parsePost(await readFile(resolve(root, 'posts', file), 'utf8'), file);
    if (post.draft) drafts.push(post.slug);
  }
  execFileSync('node', ['scripts/build.mjs'], { cwd: root, stdio: 'inherit' });
  const pages = await Promise.all(['index.html', 'writing/index.html', 'sitemap.xml'].map((p) => readFile(resolve(root, 'dist', p), 'utf8')));
  for (const slug of drafts) {
    if (await access(resolve(root, 'dist/writing', slug)).then(() => true, () => false)) throw new Error(`public build contains draft ${slug}`);
    if (pages.some((page) => page.includes(`/writing/${slug}/`))) throw new Error(`public build links draft ${slug}`);
  }
  for (const retired of ['resume.html', 'consulting.html', 'PWmedia/Frederick_Casey-Housand_Contractor.docx.pdf']) {
    await access(resolve(root, 'dist', retired)).then(() => { throw new Error(`public build contains ${retired}`); }, () => {});
  }
  await evidence('public-build', { drafts, excluded: true, retired: 'absent' });
}

async function drive(origin) {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const shot = async (name) => {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 0) throw new Error(`${page.url()} at ${viewport.width}px overflows by ${overflow}px`);
        const path = resolve(artifacts, `${stamp}-${viewport.width}-${name}.png`);
        await page.screenshot({ path, fullPage: true });
        results.push({ viewport: viewport.width, url: page.url(), overflow, screenshot: path });
      };
      await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement;
        return { text: el.textContent.trim(), outline: getComputedStyle(el).outlineStyle, top: el.getBoundingClientRect().top };
      });
      if (focus.text !== 'Skip to content' || focus.outline === 'none' || focus.top < 0) throw new Error(`first Tab focus is not a visible skip link: ${JSON.stringify(focus)}`);
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => document.activeElement.textContent.trim()) !== 'Fred Casey-Housand') throw new Error('Name must return home');
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => document.activeElement.textContent.trim()) !== 'Writing') throw new Error('Writing is not the second navigation stop');
      results.push({ viewport: viewport.width, focus: 'skip link, Fred Casey-Housand, Writing' });
      await page.evaluate(() => document.activeElement.blur());
      await shot('home');
      if (await page.locator('a[href*="tinymacro.app/initiatives"]').count()) throw new Error('Home links to the removed tinymacro.app/initiatives/ pages');
      if (!(await page.locator('a[href="https://tinymacro.app/macrolayer/"]').count())) throw new Error('Home does not link MacroLayer to tinymacro.app/macrolayer/');
      await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Writing' }).click();
      await page.waitForURL(`${origin}/writing/`);
      await page.getByRole('heading', { level: 1, name: 'Writing' }).waitFor();
      await shot('writing');
      // Every post is a plain page: a title and text, with no labels, dates, deks or contents.
      const titles = (await page.locator('.writing-list .titles a').allTextContents()).map((t) => t.replace(/\s*→$/, '').trim());
      const sources = (await readdir(resolve(root, 'posts'))).filter((file) => file.endsWith('.md'));
      if (titles.length !== sources.length) throw new Error(`expected ${sources.length} posts in the preview, found ${titles.length}`);
      if (await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: /TinyMacro/ }).getAttribute('href') !== (process.env.PERSONAL_TINYMACRO_ORIGIN ? new URL(process.env.PERSONAL_TINYMACRO_ORIGIN).origin + '/' : 'https://tinymacro.app/')) throw new Error('Missing reciprocal TinyMacro link');
      for (const title of titles) {
        await page.locator('.writing-list .titles a', { hasText: title }).click();
        await page.getByRole('heading', { level: 1, name: title }).waitFor();
        const packaging = await page.locator('time, .dek, .contents, .post-meta, .back-link, table').count();
        if (packaging) throw new Error(`${page.url()} has ${packaging} packaging element(s)`);
        if (!(await page.locator('.prose').textContent()).trim()) throw new Error('Empty post body');
        await shot(`article-${page.url().split('/').at(-2)}`);
        await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Writing' }).click();
        await page.waitForURL(`${origin}/writing/`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  await evidence('drive', { origin, results });
}

const freePort = () => new Promise((done, fail) => {
  const server = createServer().listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close(() => done(port)); }).on('error', fail);
});

async function run() {
  await draftExclusion();
  execFileSync('node', ['scripts/build.mjs', '--drafts'], { cwd: root, stdio: 'inherit' });
  const port = Number(process.argv[3]) || await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', 'dist'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', (chunk) => { output += chunk; });
  server.stderr.on('data', (chunk) => { output += chunk; });
  try {
    let ready = false;
    for (let i = 0; i < 40 && server.exitCode === null; i += 1) {
      try { await fetch(`${origin}/`); ready = true; break; } catch { await new Promise((wait) => setTimeout(wait, 250)); }
    }
    if (!ready) throw new Error(`preview did not become ready on ${origin}\n${output}`);
    await doctor(origin);
    await drive(origin);
  } finally {
    if (server.exitCode === null) {
      server.kill('SIGTERM');
      await new Promise((exit) => server.once('exit', exit));
    }
  }
}

const [command = 'run', origin] = process.argv.slice(2);
if (command === 'run') await run();
else if (command === 'doctor') await doctor(origin);
else if (command === 'drive') await drive(origin);
else throw new Error(`Unknown command ${command}`);
