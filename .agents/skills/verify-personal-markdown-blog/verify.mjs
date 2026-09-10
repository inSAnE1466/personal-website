import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const artifacts = resolve(import.meta.dirname, '.artifacts');
const origin = process.argv[3] || 'http://127.0.0.1:8011';
const routes = [
  ['/', 'Fred'],
  ['/consulting.html', 'Consulting'],
  ['/writing/', 'Writing'],
  ['/writing/sample-formatting/', 'A sample page for writing'],
];

async function fetchRoute(path) {
  const response = await fetch(`${origin}${path}`);
  const body = await response.text();
  return { path, status: response.status, contentType: response.headers.get('content-type'), body };
}

async function check(kind) {
  const checked = kind === 'doctor' ? routes.slice(0, 3) : routes;
  const results = [];
  for (const [path, marker] of checked) {
    const result = await fetchRoute(path);
    if (result.status !== 200 || !result.contentType?.includes('text/html') || !result.body.toLowerCase().includes(marker.toLowerCase())) {
      throw new Error(`${path}: expected 200 HTML containing ${marker}, got ${result.status} ${result.contentType}`);
    }
    results.push({ path, status: result.status, marker });
  }
  await mkdir(artifacts, { recursive: true });
  const file = resolve(artifacts, `${new Date().toISOString().replaceAll(':', '-')}-${kind}.json`);
  await writeFile(file, JSON.stringify({ origin, kind, results }, null, 2) + '\n');
  console.log(JSON.stringify({ origin, kind, results, evidence: file }, null, 2));
}

async function run() {
  execFileSync('node', ['scripts/build.mjs', '--drafts'], { cwd: root, stdio: 'inherit' });
  const build = spawn('python3', ['-m', 'http.server', '8011', '--bind', '127.0.0.1', '--directory', 'dist'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  build.stdout.on('data', chunk => { output += chunk; });
  build.stderr.on('data', chunk => { output += chunk; });
  try {
    let ready = false;
    for (let i = 0; i < 40; i += 1) {
      try { await fetchRoute('/'); ready = true; break; } catch { await new Promise(resolveWait => setTimeout(resolveWait, 250)); }
      if (build.exitCode !== null) throw new Error(output);
    }
    if (!ready || build.exitCode !== null) throw new Error(`preview did not become ready on 127.0.0.1:8011\n${output}`);
    await check('doctor');
    await check('drive');
  } finally {
    if (build.exitCode === null) {
      build.kill('SIGTERM');
      await new Promise(resolveExit => build.once('exit', resolveExit));
    }
  }
}

const command = process.argv[2] || 'drive';
if (command === 'run') await run();
else if (command === 'doctor' || command === 'drive') await check(command);
else throw new Error(`Unknown command ${command}`);
